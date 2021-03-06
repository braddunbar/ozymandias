'use strict'

const ms = require('ms')
const gm = require('gm').subClass({imageMagick: true})
const aws = require('aws-sdk')
const Busboy = require('busboy')
const s3 = new aws.S3({apiVersion: '2006-03-01'})
const assets = require('./assets')
const {BUCKET, STATIC_ORIGIN} = process.env

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
const put = (key, body, contentType) => s3.upload({
  ACL: 'public-read',
  Body: body,
  Bucket: BUCKET,
  CacheControl: `max-age=${ms('1y')},public`,
  ContentType: contentType,
  Key: key
}).promise()

exports.hasImage = function ({defaults, name, sizes}) {
  const Name = name[0].toUpperCase() + name.slice(1)

  // smallImage, mediumImage, largeImage, …
  for (const size of Object.keys(sizes)) {
    Object.defineProperty(this.prototype, size + Name, {
      get: function () { return this[`${name}Path`](size) }
    })
  }

  Object.assign(this.prototype, {

    // uploadImage
    [`upload${Name}`] (request) {
      return new Promise((resolve, reject) => {
        let fileFound = false
        const busboy = new Busboy({headers: request.headers})

        busboy.on('file', async (fieldName, file, fileName, encoding, mime) => {
          if (fileFound) return file.resume()
          fileFound = true

          await Promise.all([
            put(this[`${name}Key`]('original'), strip(file), mime),
            this[`convert${Name}`](file)
          ])
          resolve()
        })

        busboy.on('finish', () => { if (!fileFound) resolve() })

        request.pipe(busboy)
      })
    },

    // convertImage
    async [`convert${Name}`] (file) {
      // Use the original by default.
      if (!file) {
        file = s3.getObject({
          Bucket: BUCKET,
          Key: this[`${name}Key`]('original')
        }).createReadStream()
      }

      await Promise.all(Object.keys(sizes).map((size) =>
        put(this[`${name}Key`](size), convert(file, sizes[size]), 'image/jpeg')
      ))
      return this.update({[`${name}UpdatedAt`]: new Date()})
    },

    // imageKey
    [`${name}Key`] (size) {
      return `${this.tableName}/${this.id}/${name}/${size}`
    },

    // imagePath
    [`${name}Path`] (size) {
      const updatedAt = this[`${name}UpdatedAt`]
      if (updatedAt) {
        const key = this[`${name}Key`](size)
        return `${STATIC_ORIGIN || '/s3'}/${key}?${+updatedAt}`
      }
      if (defaults) return assets.path(defaults[this.id % defaults.length])
    }

  })
}
