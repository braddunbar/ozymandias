'use strict'

const {BUCKET} = process.env
const https = require('https')
const {get} = require('koa-route')

const fetch = (url) => new Promise((resolve, reject) => {
  https.get(url, resolve).on('error', reject)
})

module.exports = get('/s3/*', async (_) => {
  if (!BUCKET) {
    _.status = 404
    return
  }

  const path = _.url.replace(/^\/s3/, '')
  const asset = await fetch(`https://s3.amazonaws.com/${BUCKET}${path}`)
  _.set(asset.headers)
  _.body = asset
})
