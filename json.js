'use strict'

const Json = require('remora')

module.exports = (request, response, next) => {
  const original = response.json.bind(response)

  response.json = (value, locals) => {
    if (typeof value !== 'function') return original(value)
    const json = new Json(Object.assign(response.locals, locals))
    json.set(value)
    return original(json.result)
  }

  next()
}
