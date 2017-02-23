'use strict'

const ms = require('ms')
const {STATIC_ORIGIN} = process.env

module.exports = async (_, next) => {
  // Enforce https
  if (_.app.env === 'production') {
    // Redirect http to https
    if (_.get('x-forwarded-proto') !== 'https') {
      _.redirect(`https://${_.hostname}${_.originalUrl}`)
      return
    }

    // HSTS Headers
    _.set('strict-transport-security', `max-age=${ms('1y') / 1000}; includeSubDomains; preload`)
  }

  await next()

  // HTML responses only
  if (_.response.is('html')) {
    // Referrer Policy
    _.set('referrer-policy', 'no-referrer')

    // Frame Options
    _.set('x-frame-options', 'SAMEORIGIN')

    // XSS
    _.set('x-xss-protection', '1; mode=block')

    // Content type
    _.set('x-content-type-options', 'nosniff')

    // Content Security Policy
    _.csp('img-src', STATIC_ORIGIN || "'self'")
    _.csp('script-src', STATIC_ORIGIN || "'self'")
    _.csp('style-src', STATIC_ORIGIN || "'self'")
    _.csp('frame-src', "'self'")
    _.csp('connect-src', "'self'")
    _.csp('default-src', "'self'")
    _.csp('img-src', 'data: https://www.google-analytics.com')
    _.csp('script-src', 'https://www.google-analytics.com')
  }
}
