'use strict'

const db = require('./db/instance')
const bcrypt = require('bcrypt')
const ROUNDS = +process.env.HASH_ROUNDS || 12

function hash (password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, ROUNDS, (e, hash) => e ? reject(e) : resolve(hash))
  })
}

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
    return (this.data.get('email') || '').trim()
  }

  set email (value) {
    this.data.set('email', (value || '').trim())
  }

  authenticate (password) {
    if (this.password == null) return Promise.resolve(false)
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.password, (e, match) => {
        return e ? reject(e) : resolve(match)
      })
    })
  }

  update (values) {
    if (!values.password) return super.update(values)
    return hash(values.password).then((hash) => {
      values.password = hash
      return super.update(values)
    })
  }

  toJSON () {
    const json = super.toJSON()
    delete json.password
    return json
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
