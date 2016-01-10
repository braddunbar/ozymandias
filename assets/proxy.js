'use strict'

const bucket = process.env.BUCKET
const request = require('request')
const router = module.exports = require('express').Router()

router.get('*', (req, res) => {
  if (!bucket) return res.status(404).end()
  request(`https://s3.amazonaws.com/${bucket}${req.url}`).pipe(res)
})
