'use strict'

exports.reset = (set, {token}) => {
  if (token) {
    set('token', token.id)
    set('email', token.user.email)
  }
}
