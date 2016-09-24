'use strict'

const crypto = require('crypto')
const {Model} = require('./db/instance')

class Token extends Model {

  static get tableName () {
    return 'tokens'
  }

  static get columns () {
    return [
      'id',
      'userId',
      'expiresAt'
    ]
  }

  static create (values) {
    if (!values.id) values.id = crypto.randomBytes(20).toString('hex')
    return super.create(values)
  }

}

module.exports = Token

Token.belongsTo('user', {key: 'userId', model: require('./user')})
