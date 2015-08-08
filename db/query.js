'use strict'

class Query {

  constructor (model) {
    this.includes = {}
    this.db = model.db
    this.model = model
    this.table = model.table
    this.query = this.table
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

  where (columns) {
    for (let name in columns) {
      let condition
      let value = columns[name]
      if (value == null) {
        condition = this.table[name].isNull()
      } else if (Array.isArray(value)) {
        condition = this.table[name].in(value)
      } else {
        condition = this.table[name].equals(value)
      }
      this.query = this.query.where(condition)
    }
    return this
  }

  limit () {
    this.query = this.query.limit.apply(this.query, arguments)
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

}

module.exports = Query
