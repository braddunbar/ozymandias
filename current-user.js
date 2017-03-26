'use strict'

module.exports = async (_, next) => {
  const {client} = _.state
  const id = _.session.userId
  const user = id ? await _.User.find(id) : null
  _.state.currentUser = client.currentUser = user
  _.state.admin = client.admin = !!(user && user.isAdmin)
  await next()
}
