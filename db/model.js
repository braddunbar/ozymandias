'use strict'

const sql = require('sql')
const Query = require('./query')

class Model {

  constructor (data) {
    this.constructor.defineProperties()
    this.errors = {}
    this.data = new Map()
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

  get colunns () {
    return this.constructor.columns
  }

  get relations () {
    return this.constructor.relations
  }

  get properties () {
    return this.constructor.properties
  }

  slice (...args) {
    const result = {}
    for (const key of args) result[key] = this[key]
    return result
  }

  update (values) {
    for (const key in values) {
      this[key] = values[key]
      values[key] = this[key]
    }
    if (!this.valid) {
      const e = new Error('invalid')
      e.model = this
      return Promise.reject(e)
    }
    const query = this.constructor.where({id: this.id})
    return query.update(this.slice(...Object.keys(values)))
  }

  destroy () {
    return this.constructor.where({id: this.id}).delete()
  }

  validate () {
  }

  get valid () {
    this.validate()
    return Object.keys(this.errors).length === 0
  }

  toJSON () {
    const result = {}
    for (const key of this.data.keys()) result[key] = this.data.get(key)
    return result
  }

  static get table () {
    if (!this._table) {
      this._table = sql.define({name: this.tableName, columns: this.columns})
    }
    return this._table
  }

  static get properties () {
    if (!this._properties) {
      this._properties = {}
      for (const column of this.table.columns) {
        this._properties[column.property] = column
      }
    }
    return this._properties
  }

  static get relations () {
    if (!this._relations) this._relations = {}
    return this._relations
  }

  static create (values) {
    const model = new this(values)
    if (!model.valid) {
      const e = new Error('invalid')
      e.model = model
      return Promise.reject(e)
    }
    for (const key of Object.keys(values)) values[key] = model[key]
    return this.insert(values).then((values) => {
      return Object.assign(model, values)
    })
  }

  static hasMany (name, options) {
    options.many = true
    this.relations[name] = options
  }

  static belongsTo (name, options) {
    options.many = false
    this.relations[name] = options
  }

  static defineProperties () {
    if (this._propsDefined) return
    this._propsDefined = true
    for (const column of this.table.columns) {
      if (Object.getOwnPropertyDescriptor(this.prototype, column.property)) {
        continue
      }
      Object.defineProperty(this.prototype, column.property, {
        get: function () {
          return this.data.get(column.property)
        },
        set: function (value) {
          this.data.set(column.property, value)
        }
      })
    }
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
