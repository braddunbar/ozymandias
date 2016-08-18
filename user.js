'use strict'

const db = require('./db/instance')
const bcrypt = require('bcrypt')
const ROUNDS = +process.env.HASH_ROUNDS || 12

const hash = (password) => (
  new Promise((resolve, reject) => (
    bcrypt.hash(password, ROUNDS, (error, hash) => (
      error ? reject(error) : resolve(hash)
    ))
  ))
)

class User extends db.Model {

  static get tableName () {
    return 'users'
  }

  static get columns () {
    return [
      'id',
      'email',
      'password',
      'createdAt',
      'updatedAt'
    ]
  }

  get email () {
    return (this.data.get('email') || '').trim()
  }

  set email (value) {
    this.data.set('email', (value || '').trim())
  }

  authenticate (password) {
    if (this.password == null) return Promise.resolve(false)
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.password, (error, match) => (
        error ? reject(error) : resolve(match)
      ))
    })
  }

  update (values) {
    if (!values.password) return super.update(values)
    return hash(values.password).then((hash) => {
      values.password = hash
      return super.update(values)
    })
  }

  static create (values) {
    if (!values.password) return super.create(values)
    return hash(values.password).then((hash) => {
      values.password = hash
      return super.create(values)
    })
  }

}

db.User = module.exports = User
