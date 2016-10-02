'use strict'

const DB = require('./')
const db = module.exports = new DB(process.env.DATABASE_URL)

Object.assign(db.Model, require('../images'))

// development logging
db.log = function (value) {
  if (process.env.NODE_ENV !== 'development') return
  console.log(value)
}
