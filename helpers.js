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

  next()
}
