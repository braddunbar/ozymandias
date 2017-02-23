'use strict'

const {get} = require('koa-route')

module.exports = get('/assets/*', async (_, path, next) => {
  _.set('access-control-allow-origin', '*')
  await next()
})
