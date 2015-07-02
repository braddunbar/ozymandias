var express = require('express')

var ozymandias = module.exports = function () {
  var app = express()

  // No x-powered-by header.
  app.disable('x-powered-by')

  // View Engine
  app.set('view engine', 'ejs')
  app.engine('ejs', require('ejs').renderFile)

  // Middleware
  app.use(require('./helpers'))
  app.use(require('./layout'))
  app.use(require('compression')())

  return app
}

for (var p in express) ozymandias[p] = express[p]
