'use strict'

const fs = require('fs')
const crypto = require('crypto')

module.exports = crypto
  .createHash('md5')
  .update(fs.readFileSync('public/assets/.manifest.json'))
  .digest('hex')
