'use strict'

const {BUCKET} = process.env
const request = require('request')
const {get} = require('koa-route')

module.exports = get('/assets/*', function *(next) {
  if (BUCKET) {
    this.body = request(`https://s3.amazonaws.com/${BUCKET}${this.url}`)
  } else {
    this.status = 404
  }
})
