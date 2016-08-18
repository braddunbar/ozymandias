'use strict'

const db = require('../../db/instance')

class User extends db.Model {

  static get tableName () {
    return 'users'
  }

  static get columns () {
    return ['id', 'email', 'first', 'last', 'birthday']
  }

  get email () {
    return this.data.get('email')
  }

  set email (value) {
    this.data.set('email', value.trim())
  }

  validate () {
    this.errors = {}
    if (!this.email) this.errors.email = ['Email cannot be blank']
  }

}

module.exports = User
