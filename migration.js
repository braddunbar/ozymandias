'use strict'

const {Model} = require('./db/instance')

class Migration extends Model {
  static get tableName () {
    return 'migrations'
  }

  static get columns () {
    return ['id']
  }
}

module.exports = Migration
