"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const pretty_time_1 = __importDefault(require("pretty-time"));
const shelljs_1 = __importDefault(require("shelljs"));
const util_1 = require("util");
const yargs_1 = __importDefault(require("yargs"));
const globals_1 = require("./globals");
const util_2 = require("./util");
const argv = yargs_1.default
    .scriptName('build-pacakge')
    .option('packageDir', {
    default: process.cwd(),
})
    .option('forceEnableColors', {
    default: false,
}).argv;
if (argv.forceEnableColors) {
    chalk_1.default.enabled = true;
    chalk_1.default.level = 3 /* TrueColor */;
}
// tslint:disable: no-var-requires
// tslint:disable: no-require-imports
// tslint:disable-next-line: no-floating-promises
build().catch(err => {
    shelljs_1.default.echo(chalk_1.default.red(`Error while building: ${err}`));
    shelljs_1.default.exit(1);
});
async function build() {
    const PACKAGE_DIR = argv.packageDir;
    const OUTPUT_DIR = path_1.default.join(PACKAGE_DIR, `dist`);
    const ESM5_DIR = path_1.default.join(OUTPUT_DIR, `esm5`);
    const ESM2015_DIR = path_1.default.join(OUTPUT_DIR, `esm2015`);
    const UMD_DIR = path_1.default.join(OUTPUT_DIR, `umd`);
    const CJS_DIR = path_1.default.join(OUTPUT_DIR, `cjs`);
    const TEMP_DIR = path_1.default.join(OUTPUT_DIR, `temp`);
    const ROOT_DIR = path_1.default.resolve(path_1.default.join(__dirname, `..`));
    const PACKAGE = require(path_1.default.join(PACKAGE_DIR, 'package.json'));
    const PACKAGE_SIMPLE_NAME = PACKAGE.name.split('/')[1];
    const buildStart = process.hrtime();
    shelljs_1.default.echo(`Building package '${chalk_1.default.cyan(PACKAGE.name)}'...`);
    await executeStep(`Cleaning output directory`, () => {
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*`);
        shelljs_1.default.mkdir(`-p`, UMD_DIR);
        shelljs_1.default.mkdir(`-p`, CJS_DIR);
    });
    await executeStep(`Linting`, () => util_2.execAsync(`tslint`, `-c ${path_1.default.join(ROOT_DIR, 'tslint.json')}`, `-t stylish`, `--project ${PACKAGE_DIR} ${PACKAGE_DIR}/**/*.ts`));
    await executeStep(`Compiling`, () => util_2.execAsync(`tsc -p ${PACKAGE_DIR}/tsconfig.json`));
    await executeStep(`Compiling esm5`, async () => {
        const ret = await util_2.execAsync(`tsc`, `${PACKAGE_DIR}/index.ts`, `--target es5`, `--module es2015`, `--outDir ${ESM5_DIR}`, `--noLib`, `--sourceMap`, `--jsx react`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (ret.code !== 0 && ret.code !== 2) {
            return ret;
        }
        let code = 0;
        const jsFiles = await util_1.promisify(glob_1.default)(`${ESM5_DIR}/**/*.js`);
        for (const file of jsFiles) {
            code += await mapSources(file, false);
        }
        return code;
    });
    await executeStep(`Compiling esm2015`, async () => {
        const ret = await util_2.execAsync(`tsc`, `${PACKAGE_DIR}/index.ts`, `--target es2015`, `--module es2015`, `--outDir ${ESM2015_DIR}`, `--noLib`, `--sourceMap`, `--jsx react`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (ret.code !== 0 && ret.code !== 2) {
            return ret;
        }
        let code = 0;
        const jsFiles = await util_1.promisify(glob_1.default)(`${ESM2015_DIR}/**/*.js`);
        for (const file of jsFiles) {
            code += await mapSources(file, false);
        }
        return code;
    });
    const externalsArr = Object.keys(PACKAGE.dependencies || {})
        .concat(Object.keys(PACKAGE.devDependencies || {}))
        .concat(Object.keys(PACKAGE.peerDependencies || {}));
    // a bit of special handling for rxjs since it has two entry
    // points that make the dependencies heuristic fail
    if (externalsArr.includes('rxjs')) {
        externalsArr.push('rxjs/operators');
    }
    const externalsCsv = externalsArr.join(',');
    const externalsArg = externalsCsv ? ` -e ${externalsCsv}` : '';
    await executeStep(`Bundling`, async () => {
        const ret = await util_2.execAsync(`rollup`, `-f esm`, `-n ${PACKAGE.name}`, `-i ${OUTPUT_DIR}/index.js`, `-o ${TEMP_DIR}/bundle.js`, `-m`, externalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${TEMP_DIR}/bundle.js`);
        return ret;
    });
    await executeStep(`Downleveling ES2015 to ESM/ES5`, async () => {
        shelljs_1.default.cp(`${TEMP_DIR}/bundle.js`, `${TEMP_DIR}/bundle.es5.ts`);
        const ret = await util_2.execAsync(`tsc`, `${TEMP_DIR}/bundle.es5.ts`, `--target es5`, `--module es2015`, `--noLib`, `--sourceMap`);
        // 2 indicates failure with output still being generated
        // (this command will usually fail because of the --noLib flag)
        if (![0, 2].includes(ret.code)) {
            return ret;
        }
        return await mapSources(`${TEMP_DIR}/bundle.es5.js`);
    });
    const globalsArg = externalsArr.length > 0
        ? `-g ${externalsArr.map(e => `${e}:${globals_1.GLOBALS[e] || e}`).join(',')}`
        : '';
    await executeStep(`Bundling UMD (DEV)`, async () => {
        const ret = await util_2.execAsync(`rollup`, `-c ${path_1.default.join(ROOT_DIR, 'rollup.config.dev.js')}`, `-f umd`, `-i ${TEMP_DIR}/bundle.es5.js`, `-o ${UMD_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`, `-n ${PACKAGE.name}`, `-m`, `--exports named`, externalsArg, globalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${UMD_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`);
        return ret;
    });
    await executeStep(`Bundling UMD`, async () => {
        const ret = await util_2.execAsync(`rollup`, `-c ${path_1.default.join(ROOT_DIR, 'rollup.config.js')}`, `-f umd`, `-i ${TEMP_DIR}/bundle.es5.js`, `-o ${TEMP_DIR}/bundle.umd.js`, `-n ${PACKAGE.name}`, `-m`, `--exports named`, externalsArg, globalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${TEMP_DIR}/bundle.umd.js`);
        return ret;
    });
    await executeStep(`Bundling CJS (DEV)`, async () => {
        const ret = await util_2.execAsync(`rollup`, `-c ${path_1.default.join(ROOT_DIR, 'rollup.config.dev.js')}`, `-f cjs`, `-i ${TEMP_DIR}/bundle.es5.js`, `-o ${CJS_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`, `-n ${PACKAGE.name}`, `-m`, `--exports named`, externalsArg, globalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${CJS_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`);
        return ret;
    });
    await executeStep(`Bundling CJS`, async () => {
        const ret = await util_2.execAsync(`rollup`, `-c ${path_1.default.join(ROOT_DIR, 'rollup.config.js')}`, `-f cjs`, `-i ${TEMP_DIR}/bundle.es5.js`, `-o ${TEMP_DIR}/bundle.cjs.js`, `-n ${PACKAGE.name}`, `-m`, `--exports named`, externalsArg, globalsArg);
        if (ret.code !== 0) {
            return ret;
        }
        ret.code = await mapSources(`${TEMP_DIR}/bundle.cjs.js`);
        return ret;
    });
    await executeStep(`Minifying UMD`, async () => {
        const fileName = `simplux.${PACKAGE_SIMPLE_NAME}.production.min.js`;
        const code = await util_2.execAsync(`${path_1.default.join(ROOT_DIR, 'node_modules/.bin/uglifyjs')}`, false, `-c`, `-m`, `--comments`, `-o ${UMD_DIR}/${fileName}`, 
        // tslint:disable-next-line: max-line-length
        `--source-map "filename='${fileName}.map',url='./${fileName}.map',includeSources"`, `${TEMP_DIR}/bundle.umd.js`);
        if (code !== 0) {
            return code;
        }
        return await mapSources(`${UMD_DIR}/${fileName}`);
    });
    await executeStep(`Minifying CJS`, async () => {
        const fileName = `simplux.${PACKAGE_SIMPLE_NAME}.production.min.js`;
        const code = await util_2.execAsync(`${path_1.default.join(ROOT_DIR, 'node_modules/.bin/uglifyjs')}`, false, `-c`, `-m`, `--comments`, `-o ${CJS_DIR}/${fileName}`, 
        // tslint:disable-next-line: max-line-length
        `--source-map "filename='${fileName}.map',url='./${fileName}.map',includeSources"`, `${TEMP_DIR}/bundle.cjs.js`);
        if (code !== 0) {
            return code;
        }
        return await mapSources(`${CJS_DIR}/${fileName}`);
    });
    await executeStep(`Creating entry point`, async () => {
        await util_1.promisify(fs_1.default.writeFile)(`${OUTPUT_DIR}/index.js`, `'use strict'

if (process.env.NODE_ENV !== 'production') {
  module.exports = require('./cjs/simplux.${PACKAGE_SIMPLE_NAME}.development.js')
} else {
  module.exports = require('./cjs/simplux.${PACKAGE_SIMPLE_NAME}.production.min.js')
}
`);
        return 0;
    });
    await executeStep(`Adjusting bundle sourcemap sources paths`, async () => {
        const globPromise = util_1.promisify(glob_1.default);
        const bundleMapFiles = await globPromise(`${OUTPUT_DIR}/**/*.map`);
        await Promise.all(bundleMapFiles.map(async (mapFile) => {
            const fileContent = await util_1.promisify(fs_1.default.readFile)(mapFile);
            const fileContentJson = JSON.parse(fileContent.toString());
            fileContentJson.sources = fileContentJson.sources.map(s => {
                const sourcePath = path_1.default.resolve(path_1.default.join(path_1.default.dirname(mapFile), s));
                const packagePrefixSourcePath = sourcePath.replace(PACKAGE_DIR, PACKAGE.name);
                return packagePrefixSourcePath.replace(/\\/g, '/');
            });
            await util_1.promisify(fs_1.default.writeFile)(mapFile, JSON.stringify(fileContentJson));
        }));
    });
    await executeStep(`Inlining source maps`, async () => {
        const globPromise = util_1.promisify(glob_1.default);
        const esm5MapFiles = await globPromise(`${ESM5_DIR}/**/*.map`);
        const esm2015MapFiles = await globPromise(`${ESM2015_DIR}/**/*.map`);
        const developmentMapFiles = await globPromise(`${OUTPUT_DIR}/**/*.development.js.map`);
        const bundleMapFiles = esm5MapFiles
            .concat(esm2015MapFiles)
            .concat(developmentMapFiles);
        await Promise.all(bundleMapFiles.map(async (mapFile) => {
            const sourceFile = mapFile.replace(/\.map$/, '');
            const mapFileContent = await util_1.promisify(fs_1.default.readFile)(mapFile);
            const sourceFileContent = await util_1.promisify(fs_1.default.readFile)(sourceFile);
            const base64Content = mapFileContent.toString('base64');
            const adjustedSourceFileContent = sourceFileContent
                .toString()
                .replace(/# sourceMappingURL=[^\n]*/, `# sourceMappingURL=data:application/json;base64,${base64Content}`);
            await util_1.promisify(fs_1.default.writeFile)(sourceFile, adjustedSourceFileContent);
            await util_1.promisify(fs_1.default.unlink)(mapFile);
        }));
    });
    await executeStep(`Cleaning build files`, () => {
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.js.map`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.js`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.d.ts`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js.map`);
        shelljs_1.default.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.spec.d.ts`);
        shelljs_1.default.rm(`-Rf`, TEMP_DIR);
    });
    await executeStep(`Copying static assets`, () => {
        shelljs_1.default.cp(`-Rf`, [`${PACKAGE_DIR}/package.json`], OUTPUT_DIR);
        shelljs_1.default.cp(`-Rf`, [`${ROOT_DIR}/LICENSE`], OUTPUT_DIR);
        shelljs_1.default.cp(`-Rf`, [`${PACKAGE_DIR}/README.md`], OUTPUT_DIR);
    });
    const buildTime = process.hrtime(buildStart);
    const formattedBuildTime = chalk_1.default.yellow(pretty_time_1.default(buildTime, 'ms'));
    shelljs_1.default.echo(chalk_1.default.green(`Finished building package '${chalk_1.default.cyan(PACKAGE.name)}' in ${formattedBuildTime}!`));
}
async function executeStep(stepName, fn) {
    const start = process.hrtime();
    shelljs_1.default.echo(`${stepName}...`);
    let code = 0;
    try {
        const fnResult = await fn();
        code =
            typeof fnResult === 'object'
                ? fnResult.code
                : typeof fnResult === 'number'
                    ? fnResult
                    : code;
        if (typeof fnResult === 'object') {
            if (fnResult.stdout) {
                shelljs_1.default.echo(fnResult.stdout);
            }
            if (fnResult.stderr) {
                shelljs_1.default.echo(fnResult.stderr);
            }
        }
    }
    catch (err) {
        shelljs_1.default.echo(chalk_1.default.red(`${err}`));
        code = 1;
    }
    const time = process.hrtime(start);
    const formattedTime = chalk_1.default.yellow(pretty_time_1.default(time, 'ms'));
    if (code !== 0) {
        shelljs_1.default.echo(chalk_1.default.red(`${stepName} failed after ${formattedTime}!`));
        shelljs_1.default.exit(code);
    }
    shelljs_1.default.echo(chalk_1.default.green(`${stepName} successful in ${formattedTime}!`));
}
async function mapSources(file, useTwoPasses = true) {
    const sorcery = require('sorcery');
    await sorcery.loadSync(file).write();
    if (useTwoPasses) {
        // another second run of mapping the sources is required for sorcery to
        // properly map the sources since after the first run the source files
        // are correctly identified, but their content is not properly added to
        // the source mapping
        await sorcery.loadSync(file).write();
    }
    return 0;
}
