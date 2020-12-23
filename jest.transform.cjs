// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

'use strict'

const crypto = require('crypto')
const fs = require('fs')
const tsJest = require('ts-jest')

function removeJs(code) {
  return code
    .split('\n')
    .map((line) => line.replace(/([}*] from '[^']+)\.js/g, '$1'))
    .join('\n')
}

exports.process = (first, ...rest) =>
  tsJest.createTransformer().process(removeJs(first), ...rest)

exports.getCacheKey = () =>
  crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex')
