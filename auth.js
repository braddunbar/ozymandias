'use strict'

const db = require('./db/instance')

module.exports = function (req, res, next) {
  const id = req.session.userId
  if (!id) return next()
  db.User.find(id).then((user) => {
    if (!user) return next()
    req.user = res.locals.user = user
    req.admin = res.locals.admin = !!user.is_admin
    next()
  }).catch(res.error)
}
