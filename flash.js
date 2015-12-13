'use strict'

module.exports = function (req, res, next) {
  res.flash = (type, message) => {
    req.session.flash = {type: type, message: message}
  }
  req.flash = res.locals.flash = req.session.flash
  delete req.session.flash
  next()
}
