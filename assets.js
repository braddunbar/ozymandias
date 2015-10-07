'use strict'

let BUCKET = process.env.BUCKET
let express = require('express')
let request = require('request')
let router = module.exports = express.Router()

router.get('*', function (req, res) {
  if (!BUCKET) throw new Error('Assets require a BUCKET.')
  request(`https://s3.amazonaws.com/${BUCKET}${req.url}`).pipe(res)
})
