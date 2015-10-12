'use strict'

let sql = require('sql')
let Query = require('./query')

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

  slice () {
    let result = {}
    for (let key of arguments) result[key] = this[key]
    return result
  }

  update (values) {
    for (let key in values) {
      this[key] = values[key]
      values[key] = this[key]
    }
    if (!this.valid) {
      let e = new Error('invalid')
      e.model = this
      throw e
    }
    let query = this.constructor.where({id: this.id})
    return query.update(this.slice.apply(this, Object.keys(values)))
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

  static get table () {
    if (!this._table) {
      this._table = sql.define({name: this.tableName, columns: this.columns})
    }
    return this._table
  }

  static get properties () {
    if (!this._properties) {
      this._properties = {}
      for (let column of this.table.columns) {
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
    let model = new this(values)
    if (!model.valid) {
      let e = new Error('invalid')
      e.model = model
      throw e
    }
    for (let key of Object.keys(values)) values[key] = model[key]
    return this.insert(values).then(function (values) {
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
    for (let column of this.table.columns) {
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
let queryMethods = [
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
  'select',
  'update',
  'where'
]

for (let method of queryMethods) {
  Model[method] = function () {
    let query = new Query(this)
    return query[method].apply(query, arguments)
  }
}

module.exports = Model
