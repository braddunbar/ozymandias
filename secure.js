'use strict'

module.exports = function *(next) {
  if (process.env.SECURE !== '1') return yield next
  if (this.headers['x-forwarded-proto'] === 'https') return yield next
  this.redirect(`https://${this.hostname}${this.originalUrl}`)
}
