'use strict'

module.exports = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] === 'https') return next()
  res.redirect(`https://${req.hostname}${req.originalUrl}`)
}
