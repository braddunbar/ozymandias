'use strict'

module.exports = function (param, property, scope) {
  if (!scope) {
    scope = property
    property = param
    param = `${property}Id`
  }
  this.param(param, (request, response, next, id) => {
    if (!id) return next()
    scope().find(id).then((model) => {
      if (model) {
        request[property] = response.locals[property] = model
        return next()
      }
      response.notfound()
    }).catch(response.error)
  })
}
