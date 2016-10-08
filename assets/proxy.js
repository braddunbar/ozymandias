'use strict'

const bucket = process.env.BUCKET
const request = require('request')
const router = module.exports = require('express').Router()

router.get('*', (request, response) => {
  if (!bucket) return response.status(404).end()
  request(`https://s3.amazonaws.com/${bucket}${request.url}`).pipe(response)
})
