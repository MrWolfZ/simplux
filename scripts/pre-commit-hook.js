"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const shelljs_1 = __importDefault(require("shelljs"));
const util_1 = require("util");
const util_2 = require("./util");
// tslint:disable-next-line: no-var-requires no-require-imports
const stagedGitFiles = require('staged-git-files');
// tslint:disable-next-line: no-floating-promises
testChangedFiles();
async function testChangedFiles() {
    const stagedFiles = await stagedGitFiles();
    const stagedFilePaths = stagedFiles.map(f => f.filename);
    if (stagedFilePaths.length === 0) {
        return;
    }
    const packageNames = await util_1.promisify(fs_1.default.readdir)('./packages');
    let code = 0;
    for (const packageName of packageNames) {
        const changedFiles = stagedFilePaths
            .filter(f => f.startsWith(`packages/${packageName}/`))
            .filter(f => !f.endsWith('.md') && !f.endsWith('package.json'))
            .map(f => f.replace(`packages/${packageName}/`, ''));
        code += await runTestsForPackage(packageName, changedFiles);
    }
    process.exit(code);
}
async function runTestsForPackage(packageName, changedFiles) {
    if (changedFiles.length === 0) {
        return 0;
    }
    shelljs_1.default.echo(`Running tests for ${chalk_1.default.yellow(`${changedFiles.length}`)} changed file(s) of package '${chalk_1.default.cyan(packageName)}'...`);
    return await util_2.execAsync(`npm run test`, false, `--`, `--scope @simplux/${packageName}`, `--stream=false`, `--`, `--`, `--passWithNoTests`, `--findRelatedTests`, ...changedFiles);
}
