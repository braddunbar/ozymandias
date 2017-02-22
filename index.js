'use strict'

const ms = require('ms')
const Koa = require('koa')
const body = require('koa-bodyparser')
const _static = require('koa-static')
const session = require('koa-session')
const compress = require('koa-compress')

// Wrap up an express app.
const ozymandias = module.exports = function () {
  const app = new Koa()

  // Secrets!
  app.keys = [process.env.SECRET]

  // Trust proxy headers.
  app.proxy = true

  // Handle errors.
  app.use(require('./errors'))

  // Security headers
  app.use(require('./security'))

  // Compress responses by default.
  app.use(compress())

  // Add CORS headers to assets for subresource integrity check.
  app.use(require('./assets/cors'))

  // Static Assets
  app.use(_static('public', {maxAge: ms('1y')}))

  // S3 Assets
  app.use(require('./assets/proxy'))

  // Parse the request body.
  app.use(body())

  // Cookie Session
  app.use(session(app, {
    key: process.env.ID,
    maxAge: ms('30d')
  }))

  // Vary
  app.use(function *(next) {
    this.vary('Accept')
    yield next
  })

  // Extend context.
  Object.assign(app.context,
    require('./helpers'),
    require('./mail'),
    require('./react')
  )

  // Client state!
  app.use(function *(next) {
    this.state.client = {}
    yield next
  })

  // Who's the user?
  app.use(require('./current-user'))

  return app
}

// DB instance
ozymandias.db = require('./db/instance')
