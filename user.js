'use strict'

const {Model} = require('./db/instance')
const bcrypt = require('bcrypt')
const ROUNDS = +process.env.HASH_ROUNDS || 12

const hash = (password) => (
  new Promise((resolve, reject) => (
    bcrypt.hash(password, ROUNDS, (error, hash) => (
      error ? reject(error) : resolve(hash)
    ))
  ))
)

class User extends Model {

  static get tableName () {
    return 'users'
  }

  static get columns () {
    return [
      'id',
      'email',
      'isAdmin',
      'password',
      'createdAt',
      'updatedAt'
    ]
  }

  get email () {
    return (this._email || '').trim()
  }

  set email (value) {
    this._email = (value || '').trim()
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

    // Validate the password.
    if (values.password.length < 8) {
      this.errors = {
        password: ['Password must be at least eight characters long']
      }
      return Promise.reject(this.invalidError())
    }

    // Hash the password before updating.
    return hash(values.password).then((hash) => {
      values.password = hash
      return super.update(values)
    })
  }

  static create (values) {
    if (!values.password) return super.create(values)

    // Validate the password.
    if (values.password.length < 8) {
      const model = new this(values)
      model.errors = {
        password: ['Password must be at least eight characters long']
      }
      return Promise.reject(model.invalidError())
    }

    // Hash the password before creation.
    return hash(values.password).then((hash) => {
      values.password = hash
      return super.create(values)
    })
  }

  validate () {
    super.validate()

    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.errors.email = ['Invalid Email']
    }
  }
}

module.exports = User

User.hasMany('tokens', {key: 'userId', model: require('./token')})
