'use strict'

module.exports = function *(next) {
  const id = this.session.userId
  const user = this.state.currentUser = id ? yield this.User.find(id) : null
  this.state.admin = !!(user && user.isAdmin)
  yield next
}
