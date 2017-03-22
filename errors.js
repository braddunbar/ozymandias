'use strict'

const bugsnag = require('bugsnag').register(process.env.BUGSNAG_KEY)

module.exports = async (_, next) => {
  try {
    await next()
  } catch (error) {
    if (error.message === 'invalid' && error.model) {
      _.status = 422
      _.body = error.model.errors
    } else {
      console.log(error.stack)
      bugsnag.notify(error)
      _.status = 500
      _.react()
    }
  }
}
