import chalk from 'chalk'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import pretty from 'pretty-time'
import shell from 'shelljs'
import { promisify } from 'util'
import { execAsync, ExecReturnValue } from './util'

// tslint:disable: no-var-requires
// tslint:disable: no-require-imports

// tslint:disable-next-line: no-floating-promises
build().catch(err => {
  shell.echo(chalk.red(`Error while building: ${err}`))
  shell.exit(1)
})

async function build() {
  const PACKAGE_DIR = path.join(process.cwd(), process.argv[2])
  const OUTPUT_DIR = path.join(PACKAGE_DIR, `dist`)
  const BUNDLES_DIR = path.join(OUTPUT_DIR, `bundles`)
  const PACKAGE = require(path.join(PACKAGE_DIR, 'package.json'))

  const buildStart = process.hrtime()

  shell.echo(`Building package '${chalk.cyan(PACKAGE.name)}'...`)

  await executeStep(`Cleaning output directory`, () => {
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*`)
    shell.mkdir(`-p`, BUNDLES_DIR)
  })

  await executeStep(`Linting`, () =>
    execAsync(
      `tslint`,
      `-c tslint.json`,
      `-t stylish`,
      `--project ${PACKAGE_DIR} ${PACKAGE_DIR}/**/*.ts`,
    ),
  )

  await executeStep(`Compiling`, () =>
    execAsync(`tsc -p ${PACKAGE_DIR}/tsconfig.json`),
  )

  await executeStep(`Bundling`, async () => {
    const externals = Object.keys(PACKAGE.dependencies || {})
      .concat(Object.keys(PACKAGE.peerDependencies || {}))
      .join(',')
    const externalsArg = externals ? ` -e ${externals}` : ''
    const ret = await execAsync(
      `rollup`,
      `-f esm`,
      `-n ${PACKAGE.name}`,
      `-i ${OUTPUT_DIR}/index.js`,
      `-o ${BUNDLES_DIR}/bundle.js`,
      `-m`,
      externalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(`${BUNDLES_DIR}/bundle.js`)
    return ret
  })

  await executeStep(`Downleveling ES2015 to ESM/ES5`, async () => {
    shell.cp(`${BUNDLES_DIR}/bundle.js`, `${BUNDLES_DIR}/bundle.es5.ts`)
    const ret = await execAsync(
      `tsc`,
      `${BUNDLES_DIR}/bundle.es5.ts`,
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

    const code = await mapSources(`${BUNDLES_DIR}/bundle.es5.js`)

    if (code !== 0) {
      return code
    }

    shell.rm(`-f`, `${BUNDLES_DIR}/bundle.es5.ts`)

    return code
  })

  await executeStep(`Bundling UMD`, async () => {
    const externals = Object.keys(PACKAGE.dependencies || {}).concat(
      Object.keys(PACKAGE.peerDependencies || {}),
    )
    const externalsArg = externals.length > 0 ? `-e ${externals.join(',')}` : ''
    const globalsArg =
      externals.length > 0
        ? `-g ${externals.map(e => `${e}:${e}`).join(',')}`
        : ''

    const ret = await execAsync(
      `rollup`,
      `-c ${path.join(process.cwd(), 'rollup.config.js')}`,
      `-f umd`,
      `-i ${BUNDLES_DIR}/bundle.es5.js`,
      `-o ${BUNDLES_DIR}/bundle.umd.js`,
      `-n ${PACKAGE.name}`,
      `-m`,
      `--exports named`,
      externalsArg,
      globalsArg,
    )

    if (ret.code !== 0) {
      return ret
    }

    ret.code = await mapSources(`${BUNDLES_DIR}/bundle.umd.js`)
    return ret
  })

  await executeStep(`Minifying`, async () => {
    let code = await execAsync(
      `${path.join(process.cwd(), 'node_modules/.bin/uglifyjs')}`,
      false,
      `-c`,
      `-m`,
      `--comments`,
      `-o ${BUNDLES_DIR}/bundle.umd.min.js`,
      // tslint:disable-next-line: max-line-length
      `--source-map "filename='bundle.umd.min.js.map',url='bundle.umd.min.js.map',includeSources"`,
      `${BUNDLES_DIR}/bundle.umd.js`,
    )

    if (code !== 0) {
      return code
    }

    code = await mapSources(`${BUNDLES_DIR}/bundle.umd.min.js`)
    return code
  })

  await executeStep(`Adjusting bundle sourcemap sources paths`, async () => {
    const globPromise = promisify(glob)
    const bundleMapFiles = await globPromise(`${BUNDLES_DIR}/*.map`)
    await Promise.all(
      bundleMapFiles.map(async mapFile => {
        const fileContent = await promisify(fs.readFile)(mapFile)
        const fileContentJson = JSON.parse(fileContent as any) as {
          sources: string[];
        }
        fileContentJson.sources = fileContentJson.sources.map(s =>
          s.replace(/^\.\.\/\.\./, PACKAGE.name),
        )
        await promisify(fs.writeFile)(mapFile, JSON.stringify(fileContentJson))
      }),
    )
  })

  await executeStep(`Cleaning build files`, () => {
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.js`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.js.map`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/*.spec.d.ts`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.js.map`)
    shell.rm(`-Rf`, `${OUTPUT_DIR}/src/**/*.spec.d.ts`)
  })

  await executeStep(`Copying static assets`, () => {
    shell.cp(`-Rf`, [`${PACKAGE_DIR}/package.json`], OUTPUT_DIR)
    shell.cp(`-Rf`, [`LICENSE`], OUTPUT_DIR)
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

// TODO: ensure the sources path is correct
// (i.e. @simplux/core/src/... instead of ../../src/...)
async function mapSources(file: string) {
  const sorcery = require('sorcery')

  await sorcery.loadSync(file).write()

  // another second run of mapping the sources is required for sorcery to
  // properly map the sources since after the first run the source files
  // are correctly identified, but their content is not properly added to
  // the source mapping
  await sorcery.loadSync(file).write()

  return 0
}