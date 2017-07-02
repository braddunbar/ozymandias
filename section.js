'use strict'

const cache = new Map()
const pathToRegexp = require('path-to-regexp')

module.exports = async (_, next) => {
  _.section = null
  for (const section in _.sections) {
    const path = _.sections[section]
    if (!cache.has(path)) cache.set(path, pathToRegexp(path))
    if (cache.get(path).test(_.path)) {
      _.section = section
      break
    }
  }
  await next()
}
