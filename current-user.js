'use strict'

module.exports = function (request, response, next) {
  const id = request.session.userId
  if (!id) return next()
  request.app.get('user').find(id).then((user) => {
    request.currentUser = response.locals.currentUser = user
    request.admin = response.locals.admin = user && !!user.isAdmin
    next()
  }).catch(response.error)
}
