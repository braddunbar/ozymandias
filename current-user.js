'use strict'

module.exports = async (_, next) => {
  const id = _.session.userId
  const user = id ? await _.User.find(id) : null
  _.state.currentUser = _.state.client.currentUser = user
  _.state.admin = _.state.client.admin = !!(user && user.isAdmin)
  await next()
}
