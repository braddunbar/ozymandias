'use strict'

const fs = require('fs')
const gm = require('gm').subClass({imageMagick: true})
const aws = require('aws-sdk')
const mime = require('mime')
const BUCKET = process.env.BUCKET
const s3 = new aws.S3({apiVersion: '2006-03-01'})
const assets = require('./assets')

exports.hasImage = function (Model, {defaults, name, sizes}) {
  const Name = name[0].toUpperCase() + name.slice(1)

  // uploadImage
  Model.prototype[`upload${Name}`] = function (file) {
    return new Upload(file, this, {name, sizes}).send()
  }

  // imageKey
  Model.prototype[`${name}Key`] = function (size) {
    return `${this.tableName}/${this.id}/${name}/${size}`
  }

  // imagePath
  Model.prototype[`${name}Path`] = function (size) {
    const updatedAt = this[`${name}_updated_at`]
    if (updatedAt) {
      const key = this[`${name}Key`](size)
      return `/assets/${key}?${+updatedAt}`
    }
    if (defaults) return assets.path(defaults[this.id % defaults.length])
  }

  // smallImage
  for (const size of Object.keys(sizes)) {
    Object.defineProperty(Model.prototype, size + Name, {
      get: function () {
        return this[`${name}Path`](size)
      }
    })
  }
}

class Upload {

  constructor (file, model, {name, sizes}) {
    this.file = file
    this.model = model
    this.name = name
    this.sizes = Object.assign(sizes, {original: null})
  }

  get path () {
    return this.file.path
  }

  get mimetype () {
    return this.file.mimetype
  }

  s3Key (size) {
    const {model: {id, tableName}, name} = this
    return `${tableName}/${id}/${name}/${size}`
  }

  cleanup () {
    fs.unlink(this.path)
  }

  send () {
    return Promise.all(
      Object.keys(this.sizes).map(this.put.bind(this))
    ).then(() => {
      this.cleanup()
      return this.model.update({[`${this.name}_updated_at`]: new Date()})
    }).catch((e) => {
      this.cleanup()
      throw e
    })
  }

  stream (size) {
    if (size === 'original') return fs.createReadStream(this.path)
    const width = this.sizes[size]
    return gm(this.path)
      .resize(width, width, '^')
      .gravity('Center')
      .crop(width, width, 0, 0)
      .noProfile()
      .stream()
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
      }, (e) => e ? reject(e) : resolve())
    })
  }

}
