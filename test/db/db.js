'use strict'

let DB = require('../../db')
module.exports = new DB(process.env.DATABASE_URL)
