// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

'use strict'

const crypto = require('crypto')
const fs = require('fs')
const tsJest = require('ts-jest')

exports.process = (first, ...rest) =>
  tsJest.default.createTransformer().process(first, ...rest)

exports.getCacheKey = () =>
  crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex')
