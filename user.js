'use strict'

const db = require('./').db

class User extends db.Model {

  static get tableName () {
    return 'users'
  }

  static get columns () {
    return [
      'id',
      'email',
      'password',
      'created_at',
      'updated_at'
    ]
  }

  get email () {
    return this.data.get('email') || ''
  }

  set email (value) {
    this.data.set('email', value || '')
  }

}

module.exports = User
