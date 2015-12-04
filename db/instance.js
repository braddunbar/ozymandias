'use strict'

const DB = require('./')
const db = module.exports = new DB(process.env.DATABASE_URL)

// development logging
db.log = function (value) {
  if (process.env.NODE_ENV !== 'development') return
  console.log(value)
}
