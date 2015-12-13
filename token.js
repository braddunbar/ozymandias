'use strict'

const db = require('./db/instance')
const crypto = require('crypto')

class Token extends db.Model {

  static get tableName () {
    return 'tokens'
  }

  static get columns () {
    return [
      'id',
      'user_id',
      'expires_at'
    ]
  }

  static create (values) {
    if (!values.id) values.id = crypto.randomBytes(20).toString('hex')
    return super.create(values)
  }

}

db.Token = module.exports = Token
