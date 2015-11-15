'use strict'

const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const aws = require('aws-sdk')
const mime = require('mime')
const BUCKET = process.env.BUCKET
const s3 = new aws.S3({apiVersion: '2006-03-01'})

exports.hasImage = function (Model, options) {
  let name = options.name
  let Name = name[0].toUpperCase() + name.slice(1)

  Model.prototype[`upload${Name}`] = function (file) {
    return new Upload(file, this, options).send()
  }
}

class Upload {

  constructor (file, model, options) {
    this.file = file
    this.model = model
    this.name = options.name
    this.sizes = Object.assign(options.sizes, {original: null})
  }

  get ext () {
    return mime.extension(this.mimetype)
  }

  get path () {
    return this.file.path
  }

  get mimetype () {
    return this.file.mimetype
  }

  s3Key (size) {
    return `${this.model.tableName}/${this.model.id}/${size}.${this.ext}`
  }

  cleanup () {
    fs.unlink(this.path)
  }

  send () {
    return Promise.all(
      Object.keys(this.sizes).map(this.put.bind(this))
    ).then(() => {
      this.cleanup()
      return this.model.update({
        [`${this.name}_updated_at`]: new Date(),
        [`${this.name}_ext`]: this.ext
      })
    }).catch((e) => {
      this.cleanup()
      throw e
    })
  }

  stream (size) {
    if (size === 'original') return fs.createReadStream(this.path)
    let width = this.sizes[size]
    return gm(this.path).resize(width, width).noProfile().stream(this.ext)
  }

  put (size) {
    return new Promise((resolve, reject) => {
      s3.upload({
        ACL: 'public-read',
        Body: this.stream(size),
        Bucket: BUCKET,
        CacheControl: `max-age=${60 * 60 * 24 * 7}, public`,
        ContentType: this.mimetype,
        Key: this.s3Key(size)
      }, e => e ? reject(e) : resolve())
    })
  }

}