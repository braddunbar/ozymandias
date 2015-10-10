'use strict'

let body = require('body-parser')
let express = require('express')

let ozymandias = module.exports = function () {
  let app = express()

  // No x-powered-by header.
  app.disable('x-powered-by')

  // View Engine
  app.set('view engine', 'ejs')
  app.engine('ejs', require('ejs').renderFile)

  // Are we in production?
  let production = app.get('env') === 'production'

  // Static Assets
  app.use(express.static('public', {
    etag: !production,
    lastModified: !production,
    maxAge: production ? '1d' : 0
  }))

  // S3 Assets
  app.use('/assets', require('./assets'))

  // Middleware
  app.use(require('./helpers'))
  app.use(require('./layout'))
  app.use(require('compression')())
  app.use(require('./mail'))
  app.use(body.json())
  app.use(body.urlencoded({extended: false}))

  return app
}

for (let p in express) ozymandias[p] = express[p]
