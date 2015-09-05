'use strict'

let Table = require('sql/lib/table')
let Postgres = require('sql/lib/dialect/postgres')
let SQLQuery = require('sql/lib/node/query')

// Fill in some missing table methods.
for (let method of ['limit', 'offset', 'order']) {
  Table.prototype[method] = function () {
    let query = new SQLQuery(this)
    query = query[method].apply(query, arguments)
    return query
  }
}

// Visit queries as subqueries when appropriate.
let visitQuery = Postgres.prototype.visitQuery
Postgres.prototype.visitQuery = function (node) {
  if (this._queryNode) return this.visitSubquery(node)
  try {
    return visitQuery.call(this, node)
  } finally {
    this._queryNode = null
  }
}

class Query {

  constructor (model) {
    this.includes = {}
    this.db = model.db
    this.model = model
    this.table = model.table
    this.query = this.table
  }

  log () {
  }

  send () {
    return this.db.query(this.query)
  }

  insert (values) {
    let Model = this.model
    this.query = this.query.insert(values).returning(this.table.star())
    return this.send().then(function (result) {
      return new Model(result.rows[0])
    })
  }

  update (values) {
    this.query = this.query.update(values)
    return this.send()
  }

  delete () {
    this.query = this.query.delete()
    return this.send()
  }

  all () {
    let Model = this.model
    let includes = this.includes

    // Use aliases
    this.query = this.query.select(this.table.star())

    // Load models
    return this.send().then(function (result) {
      // Map models by id
      let byId

      // Construct some models
      let models = result.rows.map(function (row) { return new Model(row) })

      // Load includes
      return Promise.all(Object.keys(includes).map(function (name) {
        let conditions = {}
        let relation = Model.relations[name]

        if (relation.many) {
          conditions[relation.key] = models.map(function (model) {
            return model.id
          })
        } else {
          conditions.id = models.map(function (model) {
            return model[relation.key]
          })
        }

        // Attach includes
        let query = relation.model.include(includes[name]).where(conditions)
        return query.all().then(function (includes) {
          if (relation.many) {
            if (!byId) {
              byId = {}
              for (let model of models) byId[model.id] = model
            }
            for (let model of models) model[name] = []
            for (let include of includes) {
              byId[include[relation.key]][name].push(include)
            }
          } else {
            let byKey = {}
            for (let model of models) byKey[model[relation.key]] = model
            for (let include of includes) byKey[include.id][name] = include
          }
        })

      })).then(function () { return models })
    })
  }

  find (id) {
    if (id != null) return this.where({id: id}).find()
    return this.limit(1).all().then(function (models) {
      return models.length ? models[0] : null
    })
  }

  not (values) {
    return this._where(values, true)
  }

  where (values) {
    return this._where(values)
  }

  _where (values, not) {
    for (let name of Object.keys(values)) {
      let condition
      let value = values[name]
      if (value == null) {
        condition = this.table[name][not ? 'isNotNull' : 'isNull']()
      } else if (Array.isArray(value)) {
        condition = this.table[name][not ? 'notIn' : 'in'](value)
      } else if (value instanceof Query) {
        condition = this.table[name][not ? 'notIn' : 'in'](value.query)
      } else {
        condition = this.table[name][not ? 'notEquals' : 'equals'](value)
      }
      this.query = this.query.where(condition)
    }
    return this
  }

  limit () {
    this.query = this.query.limit.apply(this.query, arguments)
    return this
  }

  offset () {
    this.query = this.query.offset.apply(this.query, arguments)
    return this
  }

  order () {
    for (let arg of arguments) {
      if (typeof arg === 'string') {
        this.query = this.query.order(this.table[arg])
      } else if (Array.isArray(arg)) {
        this.query = this.query.order(this.table[arg[0]][arg[1]])
      } else {
        this.query = this.query.order(arg)
      }
    }
    return this
  }

  include () {
    this._include(this.includes, Array.prototype.slice.call(arguments))
    return this
  }

  _include (hash, object) {
    if (object == null) return

    if (typeof object === 'string') {
      if (!hash[object]) hash[object] = {}
      return
    }

    if (Array.isArray(object)) {
      for (let item of object) this._include(hash, item)
      return
    }

    for (let key of Object.keys(object)) {
      if (!hash[key]) hash[key] = {}
      this._include(hash[key], object[key])
    }
  }

  match (values) {
    for (let name of Object.keys(values)) {
      let value = values[name]
      this.query = this.query.where(this.table[name].match(value))
    }
    return this
  }

  select () {
    let columns = []
    for (let name of arguments) columns.push(this.table[name])
    this.query = this.query.select(columns)
    return this
  }

}

module.exports = Query
