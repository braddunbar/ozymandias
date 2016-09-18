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
    return this._email
  }

  set email (value) {
    this._email = value.trim()
  }

  validate () {
    this.errors = {}
    if (!this.email) this.errors.email = ['Email cannot be blank']
  }

}

module.exports = User

const Post = require('./post')
const Comment = require('./comment')

User.hasMany('posts', {model: Post, key: 'userId'})
User.hasMany('comments', {model: Comment, key: 'userId'})
