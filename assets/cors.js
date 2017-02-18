'use strict'

const {get} = require('koa-route')

module.exports = get('/assets/*', function *(path, next) {
  this.set('access-control-allow-origin', '*')
  yield next
})
