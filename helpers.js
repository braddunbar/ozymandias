'use strict'

const assets = require('./assets')

// Prevent XSS attacks in embedded JSON.
const escaper = /<\/(?=script)|<!(?=--)/ig

const escapes = {
  '<!': '<\\u0021',
  '</': '<\\/'
}

const escape = (match) => escapes[match]

const escapeJson = (json) => json.replace(escaper, escape)

module.exports = {

  // Attach specific params.
  permit (...keys) {
    const result = {}
    const {body} = this.request
    for (const key of keys) {
      if (body[key] !== undefined) result[key] = body[key]
    }
    return result
  },

  // Sign in a user
  signIn (user) {
    if (user) this.session.userId = user.id
  },

  // Sign out
  signOut () {
    this.session = null
  },

  unauthorized () {
    this.status = 401
    this.react()
  },

  notfound () {
    this.status = 404
    this.react()
  },

  json (id, value) {
    const json = escapeJson(JSON.stringify(value || null))
    return `<script type='application/json' id='${id}'>${json}</script>`
  },

  csp (directive, value) {
    const key = 'content-security-policy'
    const pattern = new RegExp(`(^|;)${directive}[^;]*|$`)
    this.set(key, (this.response.get(key) || '').replace(pattern, (match) => (
      match ? `${match} ${value}` : `${directive} ${value};`
    )))
  },

  script (asset) {
    const path = assets.path(asset)
    const integrity = assets.integrity(asset)
    return `<script defer src='${path}' integrity='${integrity}' crossorigin='anonymous'></script>`
  },

  styles (asset) {
    const path = assets.path(asset)
    const integrity = assets.integrity(asset)
    return `<link rel='stylesheet' href='${path}' integrity='${integrity}' crossorigin='anonymous'>`
  }

}
