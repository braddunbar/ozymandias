'use strict'

const bugsnag = require('bugsnag').register(process.env.BUGSNAG_KEY)

module.exports = async (_, next) => {
  try {
    await next()
  } catch (error) {
    // Is this a validation error?
    if (error.message === 'invalid' && error.model) {
      _.status = 422
      _.body = error.model.errors
      return
    }

    // Notify bugsnag
    bugsnag.notify(error, {
      req: _.req,
      user: _.currentUser && _.currentUser.slice('id')
    })

    // Send back a 500
    _.status = 500
    _.react()
  }
}
