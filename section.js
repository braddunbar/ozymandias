'use strict'

const cache = new Map()
const pathToRegexp = require('path-to-regexp')

module.exports = async (_, next) => {
  const {sections} = _.app

  for (const key in sections) {
    const path = sections[key]
    if (!cache.has(path)) cache.set(path, pathToRegexp(path))
    if (cache.get(path).test(_.path)) {
      _.section = key
      break
    }
  }

  await next()
}
