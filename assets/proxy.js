'use strict'

const {BUCKET} = process.env
const https = require('https')
const {get} = require('koa-route')

const fetch = (url) => new Promise((resolve, reject) => {
  https.get(url, resolve).on('error', reject)
})

module.exports = get('/s3/*', function *(next) {
  if (!BUCKET) {
    this.status = 404
    return
  }

  const path = this.url.replace(/^\/s3/, '')
  const asset = yield fetch(`https://s3.amazonaws.com/${BUCKET}${path}`)
  this.set(asset.headers)
  this.body = asset
})
