'use strict'

let Raw = require('./raw')

function uniq (array) {
  let result = []
  let set = new Set(array)
  for (let value of set) result.push(value)
  return result
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
    this.query = this.query.insert(values).returning(this.table.star())
    return this.send().then(function (result) { return result.rows[0] })
  }

  update (values) {
    this.query = this.query.update(values)
    return this.send()
  }

  delete () {
    this.query = this.query.delete()
    return this.send()
  }

  count () {
    this.query = this.query.select('count(*) as count').from(this.from)
    return this.send().then(function (result) {
      return +result.rows[0].count
    })
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

        conditions[many ? key : 'id'] = uniq(models.map(function (model) {
          return model[many ? 'id' : key]
        }))

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
    if (typeof values === 'string') {
      let params = Array.prototype.slice.call(arguments, 1)
      this.query = this.query.where(new Raw(values, params))
      return this
    }
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

  select () {
    for (let arg of arguments) {
      if (Array.isArray(arg)) {
        this.query = this.query.select(new Raw(arg[0], arg.slice(1)))
      } else {
        if (this.model.properties[arg]) arg = this.table[arg]
        this.query = this.query.select(arg)
      }
    }
    return this
  }

  join () {
    this._join(this.model, Array.prototype.slice.call(arguments))
    return this
  }

  _join (model, name) {
    if (Array.isArray(name)) {
      for (let item of name) this._join(model, item)
      return
    }

    if (typeof name === 'object') {
      for (let key of Object.keys(name)) {
        this._join(model, key)
        this._join(model.relations[key].model, name[key])
      }
      return
    }

    let condition
    let relation = model.relations[name]

    if (relation.many) {
      condition = relation.model.table[relation.key].equals(model.table.id)
    } else {
      condition = model.table[relation.key].equals(relation.model.table.id)
    }

    this.from = this.from.join(relation.model.table).on(condition)
  }

}

module.exports = Query
