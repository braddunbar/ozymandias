'use strict'

const router = module.exports = require('express').Router()

router.get('*', (request, response) => {
  response.set('Content-Type', 'text/plain')
  response.send(process.env.ACME || '')
})
