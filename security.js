'use strict'

const ms = require('ms')
const {STATIC_ORIGIN} = process.env

module.exports = function *(next) {
  // Enforce https
  if (this.app.env === 'production') {
    // Redirect http to https
    if (this.get('x-forwarded-proto') !== 'https') {
      this.redirect(`https://${this.hostname}${this.originalUrl}`)
      return
    }

    // HSTS Headers
    this.set('strict-transport-security', `max-age=${ms('1y') / 1000}; includeSubDomains; preload`)
  }

  yield next

  // HTML responses only
  if (this.response.is('html')) {
    // Frame Options
    this.set('x-frame-options', 'SAMEORIGIN')

    // XSS
    this.set('x-xss-protection', '1; mode=block')

    // Content type
    this.set('x-content-type-options', 'nosniff')

    // Content Security Policy
    this.csp('img-src', STATIC_ORIGIN || "'self'")
    this.csp('script-src', STATIC_ORIGIN || "'self'")
    this.csp('style-src', STATIC_ORIGIN || "'self'")
    this.csp('frame-src', "'self'")
    this.csp('connect-src', "'self'")
    this.csp('default-src', "'self'")
    this.csp('img-src', 'data: https://www.google-analytics.com')
    this.csp('script-src', 'https://www.google-analytics.com')
  }
}
