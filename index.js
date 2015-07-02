var express = require('express')

var ozymandias = module.exports = function () {
  return express()
}

for (var p in express) ozymandias[p] = express[p]
