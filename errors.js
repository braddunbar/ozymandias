'use strict'

const bugsnag = require('bugsnag').register(process.env.BUGSNAG_KEY)

module.exports = function *(next) {
  try {
    yield next
  } catch (error) {
    this.error(error)
    bugsnag.notify(error)
  }
}
