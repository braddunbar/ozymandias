'use strict'

const {ACME} = process.env
const {get} = require('koa-route')

module.exports = get('/.well-known/acme-challenge', function *(next) {
  this.type = 'text'
  this.body = ACME || ''
})
