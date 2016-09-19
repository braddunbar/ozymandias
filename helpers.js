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

module.exports = function (req, res, next) {
  // Attach specific params.
  req.permit = function (...keys) {
    const result = {}
    const body = req.body
    for (const key of keys) {
      if (body[key] !== undefined) result[key] = body[key]
    }
    return result
  }

  // Sign in a user
  req.signIn = function (user) {
    if (user) req.session.userId = user.id
  }

  // Sign out
  req.signOut = function () {
    req.session = null
  }

  // Put the request in the locals for convenience.
  res.locals.req = req

  // Log an error and render a 500 page.
  res.error = function (error) {
    if (error.message === 'invalid' && error.model) {
      res.status(422).json(error.model.errors)
      return
    }
    console.log(error.stack)
    res.status(500).react()
  }

  res.unauthorized = function () {
    res.status(401).react()
  }

  res.notfound = function () {
    res.status(404).react()
  }

  // JSON script tags
  res.locals.json = function (id, data) {
    const json = escapeJson(JSON.stringify(data || null))
    return `<script type='application/json' id='${id}'>${json}</script>`
  }

  next()
}
