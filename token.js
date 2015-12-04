'use strict'

const db = require('./db/instance')

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

}

module.exports = Token
