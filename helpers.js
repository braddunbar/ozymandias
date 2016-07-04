'use strict'

module.exports = function (req, res, next) {
  // Attach specific params.
  req.permit = function () {
    const result = {}
    const body = req.body
    for (const key of arguments) {
      if (body[key] !== undefined) result[key] = body[key]
    }
    return result
  }

  // Sign in a user
  req.signIn = function (user) {
    if (user) req.session.userId = user.id
  }

  // Sign out
  req.signOut = function (user) {
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
    res.status(500).render('500')
  }

  // JSON script tags
  res.locals.json = function (id, data) {
    const json = JSON.stringify(data || null).replace(/<(?=(\/script|!--))/g, '<\\')
    return `<script type='application/json' id='${id}'>${json}</script>`
  }

  next()
}
