'use strict'

const db = require('./db/instance')

module.exports = function (req, res, next) {
  const id = req.session.userId
  if (!id) return next()
  db.User.find(id).then((user) => {
    req.currentUser = res.locals.currentUser = user
    req.admin = res.locals.admin = user && !!user.is_admin
    next()
  }).catch(res.error)
}
