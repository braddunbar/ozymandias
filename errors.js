'use strict'

const bugsnag = require('bugsnag')

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

    // Is this an unauthorized error?
    if (error.status === 401) {
      _.status = 401
      return
    }

    // Is this a forbidden error?
    if (error.status === 403) {
      _.status = 403
      return
    }

    // Write the error to the console
    console.error(error.stack)

    // Notify bugsnag
    if (_.app.env === 'production') {
      const user = _.state.currentUser
      bugsnag.notify(error, {
        req: Object.assign(_.req, {host: _.hostname, protocol: _.protocol}),
        user: user && user.slice('email', 'id')
      })
    }

    // Send back a 500
    _.status = 500
    _.render()
  }
}
