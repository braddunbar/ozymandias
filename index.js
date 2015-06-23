var express = require('express')

module.exports = function () {
  var app = express()

  app.use(require('compression'))
  app.use(express.static('public'))
  app.use(require('./mid/locals-req'))

  return app
}
