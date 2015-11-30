'use strict'

const ejs = require('ejs')
const body = require('body-parser')
const express = require('express')
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

  // Require a secure connection.
  if (process.env.SECURE === '1') app.use(require('./secure'))

  // Compress responses by default.
  app.use(compression())

  // Static Assets
  app.use(express.static('public', {
    etag: !production,
    lastModified: !production,
    maxAge: production ? '1d' : 0
  }))

  // S3 Assets
  app.use('/assets', require('./assets'))

  // Parse the request body.
  app.use(body.json())
  app.use(body.urlencoded({extended: false}))

  // Middleware
  app.use(require('./helpers'))
  app.use(require('./layout'))
  app.use(require('./mail'))

  return app
}

// Assign some express properties for convenience.
Object.assign(ozymandias, express)
