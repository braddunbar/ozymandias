'use strict'

const Json = require('remora')

module.exports = (req, res, next) => {
  const original = res.json.bind(res)

  res.json = (value, locals) => {
    if (typeof value !== 'function') return original(value)
    const json = new Json(Object.assign(res.locals, locals))
    json.set(value)
    return original(json.result)
  }

  next()
}
