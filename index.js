'use strict'

const ejs = require('ejs')
const body = require('body-parser')
const express = require('express')
const session = require('cookie-session')
const compression = require('compression')

// Wrap up an express app.
const ozymandias = module.exports = function () {
  const app = express()

  // No x-powered-by header.
  app.disable('x-powered-by')

  // View Engine
  app.set('view engine', 'ejs')
  app.engine('ejs', ejs.renderFile)

  // Are we in production?
  const production = app.get('env') === 'production'

  // Use a secure connection?
  const secure = process.env.SECURE === '1'

  // Require a secure connection.
  if (secure) app.use(require('./secure'))

  // Compress responses by default.
  app.use(compression())

  // Static Assets
  app.use(express.static('public', {
    etag: !production,
    lastModified: !production,
    maxAge: production ? '1d' : 0
  }))

  // S3 Assets
  app.use('/assets', require('./assets/proxy'))

  // Parse the request body.
  app.use(body.json())
  app.use(body.urlencoded({extended: false}))

  // Cookie Session
  app.use(session({
    signed: production,
    secureProxy: secure,
    name: process.env.ID,
    secret: process.env.SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14
  }))

  // Middleware
  app.use(require('./helpers'))
  app.use(require('./layout'))
  app.use(require('./mail'))
  app.use(require('./auth'))
  app.use(require('./flash'))
  app.use(require('./react'))

  return app
}

// Assign some express properties for convenience.
Object.assign(ozymandias, express)

// DB instance
ozymandias.db = require('./db/instance')

// Router extensions
ozymandias.Router.find = require('./find')
