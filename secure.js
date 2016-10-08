'use strict'

module.exports = function (request, response, next) {
  if (request.headers['x-forwarded-proto'] === 'https') return next()
  response.redirect(`https://${request.hostname}${request.originalUrl}`)
}
