'use strict'

const ms = require('ms')

module.exports = function *(next) {
  // Frame Options
  this.set('x-frame-options', 'SAMEORIGIN')

  // XSS
  this.set('x-xss-protection', '1; mode=block')

  // Content type
  this.set('x-content-type-options', 'nosniff')

  // Content Security Policy
  this.csp('frame-src', "'self'")
  this.csp('style-src', "'self'")
  this.csp('connect-src', "'self'")
  this.csp('default-src', "'self'")
  this.csp('img-src', "'self' https://www.google-analytics.com")
  this.csp('script-src', "'self' https://www.google-analytics.com")

  if (this.app.env !== 'production') return yield next

  // HSTS Headers
  this.set('strict-transport-security', `max-age=${ms('30d') / 1000}; includeSubDomains`)

  // Redirect http to https
  if (this.get('x-forwarded-proto') !== 'https') {
    this.redirect(`https://${this.hostname}${this.originalUrl}`)
    return
  }

  yield next
}
