'use strict'

const router = module.exports = require('express').Router()

router.get('*', (req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(process.env.ACME || '')
})
