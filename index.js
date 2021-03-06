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

  // CLI
  app.cli = require('./cli')

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

  app.use(async (_, next) => {
    // Vary on the accept header
    _.vary('accept')

    // No caching by default
    _.set('cache-control', 'private, no-store, no-cache, max-age=0, must-revalidate')

    // Client state!
    _.state.client = {}

    await next()
  })

  // Extend context.
  Object.assign(app.context,
    require('./helpers'),
    require('./mail'),
    require('./render')
  )

  // Default User
  app.context.User = require('./user')

  // Sections
  app.sections = {}
  app.context.section = null

  // Who's the user?
  app.use(require('./current-user'))

  // What section is this?
  app.use(require('./section'))

  // Protect /admin section
  app.use(require('./admin'))

  // Sessions
  for (const route of require('./session')) app.use(route)

  return app
}

// DB instance
ozymandias.db = require('./db/instance')
