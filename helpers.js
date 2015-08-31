'use strict'

module.exports = function (req, res, next) {

  // Attach specific params.
  req.permit = function () {
    let result = {}
    for (let key of arguments) {
      result[key] = this.body[key]
    }
    return result
  }

  // Put the request in the locals for convenience.
  res.locals.req = req

  // Log an error and render a 500 page.
  res.error = function (e) {
    console.log(e.stack)
    res.status(500).render('500')
  }

  next()
}
