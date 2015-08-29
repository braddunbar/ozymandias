'use strict'

let sql = require('sql')
let Query = require('./query')

class Model {

  constructor (data) {
    this.constructor.defineProperties()
    this.data = new Map()
    for (let key in data) if (this.properties[key]) this[key] = data[key]
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
    for (let key in values) this[key] = values[key]
    return new Query(this.constructor)
    .where({id: this.id})
    .update(this.slice.apply(this, Object.keys(values)))
  }

  destroy () {
    return new Query(this.constructor).where({id: this.id}).delete()
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
    return new Query(this).insert(values)
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
        get: function () { return this.data.get(column.name) },
        set: function (value) { this.data.set(column.name, value) }
      })
    }
  }

}

// Attach Query methods to Model
let queryMethods = [
  'all',
  'find',
  'include',
  'limit',
  'match',
  'offset',
  'order',
  'where'
]

for (let method of queryMethods) {
  Model[method] = function () {
    let query = new Query(this)
    return query[method].apply(query, arguments)
  }
}

module.exports = Model
