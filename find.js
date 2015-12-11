'use strict'

const db = require('./db/instance')

module.exports = function (param, property, scope) {
  if (!scope) {
    scope = property
    property = param
    param = `${property}_id`
  }
  this.param(param, (req, res, next, id) => {
    if (!id) return next()
    db.transaction(() => {
      scope().find(id).then((model) => {
        if (!model) return res.status(404).render('404')
        req[property] = res.locals[property] = model
        next()
      })
    }).catch(res.error)
  })
}