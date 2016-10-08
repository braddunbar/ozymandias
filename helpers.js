'use strict'

// Prevent XSS attacks in embedded JSON.
const escapeJson = (json) => (
  json.replace(/<\/script|<!--/g, (match) => {
    switch (match) {
      case '<!--': return '<\\u0021--'
      case '</script': return '<\\/script'
    }
  })
)

module.exports = function (request, response, next) {
  // Attach specific params.
  request.permit = function (...keys) {
    const result = {}
    const body = request.body
    for (const key of keys) {
      if (body[key] !== undefined) result[key] = body[key]
    }
    return result
  }

  // Sign in a user
  request.signIn = function (user) {
    if (user) request.session.userId = user.id
  }

  // Sign out
  request.signOut = function () {
    request.session = null
  }

  // Put the request in the locals for convenience.
  response.locals.request = request

  // Log an error and render a 500 page.
  response.error = function (error) {
    if (error.message === 'invalid' && error.model) {
      response.status(422).json(error.model.errors)
      return
    }
    console.log(error.stack)
    response.status(500).react()
  }

  response.unauthorized = function () {
    response.status(401).react()
  }

  response.notfound = function () {
    response.status(404).react()
  }

  // JSON script tags
  response.locals.json = function (id, data) {
    const json = escapeJson(JSON.stringify(data || null))
    return `<script type='application/json' id='${id}'>${json}</script>`
  }

  next()
}
