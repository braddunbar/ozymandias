'use strict'

const ms = require('ms')
const koa = require('koa')
const body = require('koa-bodyparser')
const _static = require('koa-static')
const session = require('koa-session')
const compress = require('koa-compress')

// Wrap up an express app.
const ozymandias = module.exports = function () {
  const app = koa()

  // Secrets!
  app.keys = [process.env.SECRET]

  // Handle errors.
  app.use(require('./errors'))

  // Require a secure connection.
  app.use(require('./secure'))

  // Compress responses by default.
  app.use(compress())

  // Static Assets
  app.use(_static('public', {maxAge: ms('1y')}))

  // S3 Assets
  app.use(require('./assets/proxy'))

  // Acme Challenge
  app.use(require('./acme'))

  // Parse the request body.
  app.use(body())

  // Cookie Session
  app.use(session(app, {
    key: process.env.ID,
    maxAge: ms('30d')
  }))

  // Extend context.
  Object.assign(app.context,
    require('./helpers'),
    require('./mail'),
    require('./react')
  )

  // Who's the user?
  app.use(require('./current-user'))

  // Session handlers.
  for (const handler of require('./session')) app.use(handler)

  return app
}

// DB instance
ozymandias.db = require('./db/instance')
