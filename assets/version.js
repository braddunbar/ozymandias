'use strict'

const crypto = require('crypto')

if (process.env.NODE_ENV === 'production') {
  module.exports = crypto
    .createHash('md5')
    .update(JSON.stringify(require('./fingerprints.json')))
    .digest('hex')
} else {
  module.exports = '☃'
}
