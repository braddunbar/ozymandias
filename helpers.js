'use strict'

module.exports = function (req, res, next) {
  // Attach specific params.
  req.permit = function () {
    let result = {}
    let body = req.body
    for (let key of arguments) if (body[key] != null) result[key] = body[key]
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
  res.error = function (e) {
    console.log(e.stack)
    res.status(500).render('500')
  }

  // JSON script tags
  res.locals.json = function (id, data) {
    let json = JSON.stringify(data || null).replace(/<(?=(\/script|!--))/g, '<\\')
    return `<script type='application/json' id='${id}'>${json}</script>`
  }

  next()
}
