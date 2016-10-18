'use strict'

module.exports = function *(next) {
  const id = this.session.userId
  const user = id ? yield this.User.find(id) : null
  this.state.currentUser = this.state.client.currentUser = user
  this.state.admin = this.state.client.admin = !!(user && user.isAdmin)
  yield next
}
