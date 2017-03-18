'use strict'

const sql = require('sql')
const Query = require('./query')
const {hasOwnProperty} = Object.prototype

const snakeCase = (value) => (
  value.replace(/[A-Z]+/g, (upper) => `_${upper.toLowerCase()}`)
)

class Model {
  constructor (data) {
    Object.assign(this, data)
  }

  get db () {
    return this.constructor.db
  }

  get table () {
    return this.constructor.table
  }

  get tableName () {
    return this.constructor.tableName
  }

  get columns () {
    return this.constructor.columns
  }

  get relations () {
    return this.constructor.relations
  }

  slice (...args) {
    const result = {}
    for (const key of args) result[key] = this[key]
    return result
  }

  async update (values) {
    for (const key in values) {
      this[key] = values[key]
      values[key] = this[key]
    }
    if (!this.valid) throw this.invalidError()
    const query = this.constructor.where({id: this.id})
    return query.update(this.slice(...Object.keys(values)))
  }

  destroy () {
    return this.constructor.where({id: this.id}).delete()
  }

  validate () {
    this.errors = {}
  }

  get valid () {
    this.validate()
    return Object.keys(this.errors).length === 0
  }

  invalidError () {
    const error = new Error('invalid')
    error.model = this
    return error
  }

  toJSON () {
    return {}
  }

  static get table () {
    if (!hasOwnProperty.call(this, '_table')) {
      this._table = sql.define({
        name: this.tableName,
        columns: this.columns.map((property) => ({
          property,
          name: snakeCase(property)
        }))
      })
    }
    return this._table
  }

  static get relations () {
    if (!hasOwnProperty.call(this, '_relations')) this._relations = {}
    return this._relations
  }

  static async create (values) {
    const model = new this(values)
    if (!model.valid) throw model.invalidError()
    for (const key of Object.keys(values)) values[key] = model[key]
    return Object.assign(model, await this.insert(values))
  }

  static hasMany (name, options) {
    options.many = true
    this.relations[name] = options
  }

  static belongsTo (name, options) {
    options.many = false
    this.relations[name] = options
  }
}

// Attach Query methods to Model
const queryMethods = [
  'all',
  'count',
  'find',
  'groupBy',
  'include',
  'insert',
  'join',
  'leftJoin',
  'limit',
  'not',
  'offset',
  'order',
  'paginate',
  'search',
  'select',
  'update',
  'where'
]

for (const method of queryMethods) {
  Model[method] = function (...args) {
    return new Query(this)[method](...args)
  }
}

module.exports = Model
