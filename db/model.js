'use strict'

let Query = require('./query')

class Model {

  constructor (data) {
    this.data = new Map()
    for (let key in data) if (this.properties[key]) this[key] = data[key]
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

}

// Attach Query methods to Model
let queryMethods = [
  'all',
  'find',
  'include',
  'limit',
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
