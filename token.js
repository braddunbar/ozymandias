'use strict'

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
}

module.exports = Token

Token.belongsTo('user', {key: 'userId', model: require('./user')})
