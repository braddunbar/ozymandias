'use strict'

const gm = require('gm').subClass({imageMagick: true})
const aws = require('aws-sdk')
const Busboy = require('busboy')
const BUCKET = process.env.BUCKET
const s3 = new aws.S3({apiVersion: '2006-03-01'})
const assets = require('./assets')

// Strip an image stream and write it out.
const strip = (file) => gm(file).strip().stream()

// Convert a specific image size.
const convert = (file, size) => (
  gm(file)
  .strip()
  .interlace('Plane')
  .resize(size, size, '^')
  .gravity('Center')
  .crop(size, size, 0, 0)
  .quality(70)
  .density(72, 72)
  .stream('.jpg')
)

// Upload an image to s3.
const put = (key, body, contentType) => (
  new Promise((resolve, reject) => s3.upload({
    ACL: 'public-read',
    Body: body,
    Bucket: BUCKET,
    CacheControl: `max-age=${60 * 60 * 24 * 7},public`,
    ContentType: contentType,
    Key: key
  }, (error) => error ? reject(error) : resolve()))
)

exports.hasImage = function (Model, {defaults, name, sizes}) {
  const Name = name[0].toUpperCase() + name.slice(1)

  // uploadImage
  Model.prototype[`upload${Name}`] = function (req) {
    return new Promise((resolve, reject) => {
      let fileFound = false
      const busboy = new Busboy({headers: req.headers})

      busboy.on('file', (fieldName, file, fileName, encoding, mime) => {
        if (fileFound) return file.resume()
        fileFound = true

        Promise.all([
          put(this[`${name}Key`]('original'), strip(file), mime),
          this[`convert${Name}`](file)
        ]).then(() => (
          this.update({[`${name}UpdatedAt`]: new Date()})
        )).then(() => resolve())
      })

      busboy.on('finish', () => { if (!fileFound) resolve() })

      req.pipe(busboy)
    })
  }

  // convertImage
  Model.prototype[`convert${Name}`] = function (file) {
    return Promise.all(Object.keys(sizes).map((size) => (
      put(this[`${name}Key`](size), convert(file, sizes[size]), 'image/jpeg')
    )))
  }

  // imageKey
  Model.prototype[`${name}Key`] = function (size) {
    return `${this.tableName}/${this.id}/${name}/${size}`
  }

  // imagePath
  Model.prototype[`${name}Path`] = function (size) {
    const updatedAt = this[`${name}UpdatedAt`]
    if (updatedAt) {
      const key = this[`${name}Key`](size)
      return `/assets/${key}?${+updatedAt}`
    }
    if (defaults) return assets.path(defaults[this.id % defaults.length])
  }

  // smallImage, mediumImage, largeImage, …
  for (const size of Object.keys(sizes)) {
    Object.defineProperty(Model.prototype, size + Name, {
      get: function () { return this[`${name}Path`](size) }
    })
  }
}
