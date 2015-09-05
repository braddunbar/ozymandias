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
    this.from = this.table
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
    this.query = this.query.select(this.table.star()).from(this.from)

    // Load models
    return this.send().then(function (result) {
      // Construct some models
      let models = result.rows.map(function (row) { return new Model(row) })

      // Load includes
      return Promise.all(Object.keys(includes).map(function (name) {
        let relation = Model.relations[name]
        let conditions = {}
        let key = relation.key
        let many = relation.many

        conditions[many ? key : 'id'] = models.map(function (model) {
          return model[many ? 'id' : key]
        })

        // Attach includes
        return relation.model
        .where(conditions)
        .include(includes[name])
        .all().then(function (includes) {
          let byId = {}
          if (many) {
            for (let model of models) {
              model[name] = []
              byId[model.id] = model
            }
            for (let include of includes) {
              byId[include[key]][name].push(include)
            }
          } else {
            for (let include of includes) byId[include.id] = include
            for (let model of models) model[name] = byId[model[key]]
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
    return this._where(this.model, values, true)
  }

  where (values) {
    return this._where(this.model, values)
  }

  _where (model, values, not) {
    let table = model.table

    for (let name of Object.keys(values)) {
      let condition
      let value = values[name]

      if (value == null) {
        condition = table[name][not ? 'isNotNull' : 'isNull']()
      } else if (Array.isArray(value)) {
        condition = table[name][not ? 'notIn' : 'in'](value)
      } else if (value instanceof Query) {
        condition = table[name][not ? 'notIn' : 'in'](value.query)
      } else if (value instanceof Date || typeof value !== 'object') {
        condition = table[name][not ? 'notEquals' : 'equals'](value)
      } else {
        this._where(model.relations[name].model, value, not)
        continue
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

  join () {
    for (let name of arguments) {
      let condition
      let relation = this.model.relations[name]

      if (relation.many) {
        condition = relation.model.table[relation.key].equals(this.table.id)
      } else {
        condition = this.table[relation.key].equals(relation.model.table.id)
      }

      this.from = this.from.join(relation.model.table).on(condition)
    }
    return this
  }

}

module.exports = Query
