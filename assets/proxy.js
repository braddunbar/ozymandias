'use strict'

const https = require('https')
const {get} = require('koa-route')

const fetch = (url) => new Promise((resolve, reject) => {
  https.get(url, resolve).on('error', reject)
})

module.exports = get('/assets/*', function *(next) {
  if (!process.env.BUCKET) {
    this.status = 404
    return
  }

  const path = process.env.BUCKET + this.url.replace(/^\/assets/, '')
  this.body = yield fetch(`https://s3.amazonaws.com/${path}`)
})
