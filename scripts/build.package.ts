import chalk, { Level } from 'chalk'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import pretty from 'pretty-time'
import shell from 'shelljs'
import { promisify } from 'util'
import yargs from 'yargs'
import { GLOBALS } from './globals'
import { execAsync, ExecReturnValue } from './util'

const argv = yargs
  .scriptName('build-pacakge')
  .option('packageDir', {
    default: process.cwd(),
  })
  .option('forceEnableColors', {
    default: false,
  }).argv

if (argv.forceEnableColors) {
  chalk.enabled = true
  chalk.level = Level.TrueColor
}

// tslint:disable: no-var-requires
// tslint:disable: no-require-imports

// tslint:disable-next-line: no-floating-promises
build().catch(err => {
  shell.echo(chalk.red(`Error while building: ${err}`))
  shell.exit(1)
})

async function build() {
  const PACKAGE_DIR = argv.packageDir
  const OUTPUT_DIR = path.join(PACKAGE_DIR, `dist`)
  const UMD_DIR = path.join(OUTPUT_DIR, `umd`)
  const CJS_DIR = path.join(OUTPUT_DIR, `cjs`)
  const TEMP_DIR = path.join(OUTPUT_DIR, `temp`)
  const ROOT_DIR = path.resolve(path.join(__dirname, `..`))
  const PACKAGE = require(path.join(PACKAGE_DIR, 'package.json'))
  const PACKAGE_SIMPLE_NAME = PACKAGE.name.split('/')[1]

  const buildStart = process.hrtime()

  shell.echo(`Building package '${chalk.cyan(PACKAGE.name)}'...`)

  await executeStep(`Cleaning output directory`, () => {
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*`)
    shell.mkdir(`-p`, UMD_DIR)
    shell.mkdir(`-p`, CJS_DIR)
  })

  await executeStep(`Linting`, () =>
    execAsync(
      `tslint`,
      `-c ${path.join(ROOT_DIR, 'tslint.json')}`,
      `-t stylish`,
      `--project ${PACKAGE_DIR} ${PACKAGE_DIR}/**/*.ts`,
    ),
  )

  await executeStep(`Compiling`, () =>
    execAsync(`tsc -p ${PACKAGE_DIR}/tsconfig.json`),
  )

  await executeStep(`Compiling esm5`, async () => {
    const ret = await execAsync(
      `tsc`,
      `${PACKAGE_DIR}/index.ts`,
      `--target es5`,
      `--module es2015`,
      `--outDir ${OUTPUT_DIR}/esm5`,
      `--noLib`,
      `--sourceMap`,
      `--jsx react`,
    )

    // 2 indicates failure with output still being generated
    // (this command will usually fail because of the --noLib flag)
    if (![0, 2].includes(ret.code)) {
      return ret
    }

    const globPromise = promisify(glob)
    const jsFiles = await globPromise(`${OUTPUT_DIR}/esm5/**/*.js`)

    let code = 0

    for (const file of jsFiles) {
      code += await mapSources(file, false)
    }

    return code
  })

  await executeStep(`Compiling esm2015`, async () => {
    const ret = await execAsync(
      `tsc`,
      `${PACKAGE_DIR}/index.ts`,
      `--target es2015`,
      `--module es2015`,
      `--outDir ${OUTPUT_DIR}/esm2015`,
      `--noLib`,
      `--sourceMap`,
      `--jsx react`,
    )

    // 2 indicates failure with output still being generated
    // (this command will usually fail because of the --noLib flag)
    if (![0, 2].includes(ret.code)) {
      return ret
    }

    const globPromise = promisify(glob)
    const jsFiles = await globPromise(`${OUTPUT_DIR}/esm2015/**/*.js`)

    let code = 0

    for (const file of jsFiles) {
      code += await mapSources(file, false)
    }

    return code
  })

  const externalsArr = Object.keys(PACKAGE.dependencies || {})
    .concat(Object.keys(PACKAGE.devDependencies || {}))
    .concat(Object.keys(PACKAGE.peerDependencies || {}))

  // a bit of special handling for rxjs since it has two entry
  // points that make the dependencies heuristic fail
  if (externalsArr.includes('rxjs')) {
    externalsArr.push('rxjs/operators')
  }

  const externalsCsv = externalsArr.join(',')
  const externalsArg = externalsCsv ? ` -e ${externalsCsv}` : ''

  await executeStep(`Bundling`, async () => {
    const ret = await execAsync(
      `rollup`,
      `-f esm`,
      `-n ${PACKAGE.name}`,
      `-i ${OUTPUT_DIR}/index.js`,
      `-o ${TEMP_DIR}/bundle.js`,
      `-m`,
      externalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(`${TEMP_DIR}/bundle.js`)
    return ret
  })

  await executeStep(`Downleveling ES2015 to ESM/ES5`, async () => {
    shell.cp(`${TEMP_DIR}/bundle.js`, `${TEMP_DIR}/bundle.es5.ts`)
    const ret = await execAsync(
      `tsc`,
      `${TEMP_DIR}/bundle.es5.ts`,
      `--target es5`,
      `--module es2015`,
      `--noLib`,
      `--sourceMap`,
    )

    // 2 indicates failure with output still being generated
    // (this command will usually fail because of the --noLib flag)
    if (![0, 2].includes(ret.code)) {
      return ret
    }

    return await mapSources(`${TEMP_DIR}/bundle.es5.js`)
  })

  const globalsArg =
    externalsArr.length > 0
      ? `-g ${externalsArr.map(e => `${e}:${GLOBALS[e] || e}`).join(',')}`
      : ''

  await executeStep(`Bundling UMD (DEV)`, async () => {
    const ret = await execAsync(
      `rollup`,
      `-c ${path.join(ROOT_DIR, 'rollup.config.dev.js')}`,
      `-f umd`,
      `-i ${TEMP_DIR}/bundle.es5.js`,
      `-o ${UMD_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`,
      `-n ${PACKAGE.name}`,
      `-m`,
      `--exports named`,
      externalsArg,
      globalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(
      `${UMD_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`,
    )

    return ret
  })

  await executeStep(`Bundling UMD`, async () => {
    const ret = await execAsync(
      `rollup`,
      `-c ${path.join(ROOT_DIR, 'rollup.config.js')}`,
      `-f umd`,
      `-i ${TEMP_DIR}/bundle.es5.js`,
      `-o ${TEMP_DIR}/bundle.umd.js`,
      `-n ${PACKAGE.name}`,
      `-m`,
      `--exports named`,
      externalsArg,
      globalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(`${TEMP_DIR}/bundle.umd.js`)
    return ret
  })

  await executeStep(`Bundling CJS (DEV)`, async () => {
    const ret = await execAsync(
      `rollup`,
      `-c ${path.join(ROOT_DIR, 'rollup.config.dev.js')}`,
      `-f cjs`,
      `-i ${TEMP_DIR}/bundle.es5.js`,
      `-o ${CJS_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`,
      `-n ${PACKAGE.name}`,
      `-m`,
      `--exports named`,
      externalsArg,
      globalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(
      `${CJS_DIR}/simplux.${PACKAGE_SIMPLE_NAME}.development.js`,
    )

    return ret
  })

  await executeStep(`Bundling CJS`, async () => {
    const ret = await execAsync(
      `rollup`,
      `-c ${path.join(ROOT_DIR, 'rollup.config.js')}`,
      `-f cjs`,
      `-i ${TEMP_DIR}/bundle.es5.js`,
      `-o ${TEMP_DIR}/bundle.cjs.js`,
      `-n ${PACKAGE.name}`,
      `-m`,
      `--exports named`,
      externalsArg,
      globalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(`${TEMP_DIR}/bundle.cjs.js`)
    return ret
  })

  await executeStep(`Minifying UMD`, async () => {
    const fileName = `simplux.${PACKAGE_SIMPLE_NAME}.production.min.js`

    const code = await execAsync(
      `${path.join(ROOT_DIR, 'node_modules/.bin/uglifyjs')}`,
      false,
      `-c`,
      `-m`,
      `--comments`,
      `-o ${UMD_DIR}/${fileName}`,
      // tslint:disable-next-line: max-line-length
      `--source-map "filename='${fileName}.map',url='${fileName}.map',includeSources"`,
      `${TEMP_DIR}/bundle.umd.js`,
    )

    if (code !== 0) {
      return code
    }

    return await mapSources(`${UMD_DIR}/${fileName}`)
  })

  await executeStep(`Minifying CJS`, async () => {
    const fileName = `simplux.${PACKAGE_SIMPLE_NAME}.production.min.js`

    const code = await execAsync(
      `${path.join(ROOT_DIR, 'node_modules/.bin/uglifyjs')}`,
      false,
      `-c`,
      `-m`,
      `--comments`,
      `-o ${CJS_DIR}/${fileName}`,
      // tslint:disable-next-line: max-line-length
      `--source-map "filename='${fileName}.map',url='${fileName}.map',includeSources"`,
      `${TEMP_DIR}/bundle.cjs.js`,
    )

    if (code !== 0) {
      return code
    }

    return await mapSources(`${CJS_DIR}/${fileName}`)
  })

  await executeStep(`Creating entry point`, async () => {
    await promisify(fs.writeFile)(
      `${OUTPUT_DIR}/index.js`,
      `'use strict'

if (process.env.NODE_ENV !== 'production') {
  module.exports = require('./cjs/simplux.${PACKAGE_SIMPLE_NAME}.development.js')
} else {
  module.exports = require('./cjs/simplux.${PACKAGE_SIMPLE_NAME}.production.min.js')
}
`,
    )
    return 0
  })

  await executeStep(`Adjusting bundle sourcemap sources paths`, async () => {
    const globPromise = promisify(glob)
    const bundleMapFiles = await globPromise(`${OUTPUT_DIR}/**/*.map`)
    await Promise.all(
      bundleMapFiles.map(async mapFile => {
        const fileContent = await promisify(fs.readFile)(mapFile)
        const fileContentJson = JSON.parse(fileContent as any) as {
          // tslint:disable-next-line:trailing-comma type-literal-delimiter
          sources: string[]
        }

        fileContentJson.sources = fileContentJson.sources.map(s => {
          const sourcePath = path.resolve(path.join(path.dirname(mapFile), s))
          const packagePrefixSourcePath = sourcePath.replace(
            PACKAGE_DIR,
            PACKAGE.name,
          )

          return packagePrefixSourcePath.replace(/\\/g, '/')
        })
        await promisify(fs.writeFile)(mapFile, JSON.stringify(fileContentJson))
      }),
    )
  })

  await executeStep(`Cleaning build files`, () => {
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.js.map`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.js`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.d.ts`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js.map`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.spec.d.ts`)
    shell.rm(`-Rf`, TEMP_DIR)
  })

  await executeStep(`Copying static assets`, () => {
    shell.cp(`-Rf`, [`${PACKAGE_DIR}/package.json`], OUTPUT_DIR)
    shell.cp(`-Rf`, [`${ROOT_DIR}/LICENSE`], OUTPUT_DIR)
    shell.cp(`-Rf`, [`${PACKAGE_DIR}/README.md`], OUTPUT_DIR)
  })

  const buildTime = process.hrtime(buildStart)
  const formattedBuildTime = chalk.yellow(pretty(buildTime, 'ms'))

  shell.echo(
    chalk.green(
      `Finished building package '${chalk.cyan(
        PACKAGE.name,
      )}' in ${formattedBuildTime}!`,
    ),
  )
}

type StepReturnValue = void | number | ExecReturnValue

async function executeStep(
  stepName: string,
  fn: () => Promise<StepReturnValue> | StepReturnValue,
) {
  const start = process.hrtime()
  shell.echo(`${stepName}...`)
  let code = 0
  try {
    const fnResult = await fn()
    code =
      typeof fnResult === 'object'
        ? fnResult.code
        : typeof fnResult === 'number'
        ? fnResult
        : code

    if (typeof fnResult === 'object') {
      if (fnResult.stdout) {
        shell.echo(fnResult.stdout)
      }

      if (fnResult.stderr) {
        shell.echo(fnResult.stderr)
      }
    }
  } catch (err) {
    shell.echo(chalk.red(`${err}`))
    code = 1
  }

  const time = process.hrtime(start)
  const formattedTime = chalk.yellow(pretty(time, 'ms'))

  if (code !== 0) {
    shell.echo(chalk.red(`${stepName} failed after ${formattedTime}!`))
    shell.exit(code)
  }

  shell.echo(chalk.green(`${stepName} successful in ${formattedTime}!`))
}

async function mapSources(file: string, useTwoPasses = true) {
  const sorcery = require('sorcery')

  await sorcery.loadSync(file).write()

  if (useTwoPasses) {
    // another second run of mapping the sources is required for sorcery to
    // properly map the sources since after the first run the source files
    // are correctly identified, but their content is not properly added to
    // the source mapping
    await sorcery.loadSync(file).write()
  }

  return 0
}
