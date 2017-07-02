'use strict'

const cache = new Map()
const pathToRegexp = require('path-to-regexp')

module.exports = async (_, next) => {
  for (const key in _.sections) {
    const path = _.sections[key]
    if (!cache.has(path)) cache.set(path, pathToRegexp(path))
    if (cache.get(path).test(_.path)) {
      _.section = key
      break
    }
  }
  await next()
}
