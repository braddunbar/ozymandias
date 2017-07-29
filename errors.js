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
    _.react()
  }
}
