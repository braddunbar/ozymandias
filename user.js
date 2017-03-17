'use strict'

const {Model} = require('./db/instance')
const bcrypt = require('bcrypt')
const ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 1

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

  get isAdmin () {
    return !!+this._isAdmin || false
  }

  set isAdmin (value) {
    this._isAdmin = !!+value || false
  }

  authenticate (password) {
    if (this.password == null) return Promise.resolve(false)
    return bcrypt.compare(password, this.password)
  }

  async update (values) {
    if (!values.password) return super.update(values)

    // Validate the password.
    if (values.password.length < 8) {
      this.errors = {
        password: ['Password must be at least eight characters long']
      }
      return Promise.reject(this.invalidError())
    }

    // Hash the password before updating.
    values.password = await bcrypt.hash(values.password, ROUNDS)
    return super.update(values)
  }

  static async create (values) {
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
    values.password = await bcrypt.hash(values.password, ROUNDS)
    return super.create(values)
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
