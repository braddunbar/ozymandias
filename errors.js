'use strict'

const bugsnag = require('bugsnag').register(process.env.BUGSNAG_KEY)

module.exports = async (_, next) => {
  try {
    await next()
  } catch (error) {
    _.error(error)
    bugsnag.notify(error)
  }
}
