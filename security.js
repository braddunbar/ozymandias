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
  this.set('content-security-policy', "default-src 'self' https://www.google-analytics.com")

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
