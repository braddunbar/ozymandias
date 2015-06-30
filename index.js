var express = require('express')

var ozymandias = module.exports = function () {
  var app = express()

  app.use(require('compression'))
  app.use(express.static('public'))
  app.use(require('./helpers'))

  return app
}

for (var p in express) ozymandias[p] = express[p]
