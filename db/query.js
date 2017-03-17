'use strict'

const Raw = require('./raw')
const Column = require('sql/lib/column')

class Query {
  uniq (array) {
    return Array.from(new Set(array))
  }

  constructor (model) {
    this.includes = {}
    this.db = model.db
    this.model = model
    this.table = this.query = this.from = model.table
  }

  send () {
    return this.db.query(this.query.toQuery())
  }

  async insert (values) {
    this.query = this.query.insert(values).returning(this.table.star())
    return (await this.send()).rows[0]
  }

  update (values) {
    this.query = this.query.update(values)
    return this.send()
  }

  ['delete'] () {
    this.query = this.query.delete()
    return this.send()
  }

  async count () {
    this.query = this.query.select('count(*) as count').from(this.from)
    return +(await this.send()).rows[0].count
  }

  async all () {
    const Model = this.model

    // Use aliases
    this.query = this.query.select(this.table.star()).from(this.from)

    // Load models
    const models = (await this.send()).rows.map((row) => new Model(row))

    // Load includes
    await Promise.all(Object.keys(this.includes).map(async (name) => {
      const relation = Model.relations[name]
      const conditions = {}
      const {key, many} = relation

      conditions[many ? key : 'id'] = this.uniq(models.map((model) => (
        model[many ? 'id' : key]
      )))

      // Attach includes
      return relation.model
      .where(conditions)
      .include(this.includes[name])
      .all().then((includes) => {
        const byId = {}
        if (many) {
          for (const model of models) {
            model[name] = []
            byId[model.id] = model
          }
          for (const include of includes) {
            byId[include[key]][name].push(include)
          }
        } else {
          for (const include of includes) byId[include.id] = include
          for (const model of models) model[name] = byId[model[key]]
        }
      })
    }))

    return models
  }

  async find (id) {
    if (id != null) return this.where({id: id}).find()
    const models = await this.limit(1).all()
    return models.length ? models[0] : null
  }

  async paginate (page, count) {
    const models = await this.offset((page - 1) * count).limit(count + 1).all()
    models.more = models.length > count
    if (models.more) models.pop()
    return models
  }

  not (values) {
    return this._where(this.model, values, true)
  }

  where (values, ...params) {
    if (typeof values === 'string') {
      this.query = this.query.where(new Raw(values, params))
      return this
    }
    return this._where(this.model, values)
  }

  _where (model, values, not) {
    const table = model.table

    for (const name of Object.keys(values)) {
      let condition
      const value = values[name]

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

  limit (...args) {
    this.query = this.query.limit(...args)
    return this
  }

  offset (...args) {
    this.query = this.query.offset(...args)
    return this
  }

  order (...args) {
    for (const arg of args) {
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

  include (...args) {
    this._include(this.includes, args)
    return this
  }

  _include (hash, object) {
    if (object == null) return

    if (typeof object === 'string') {
      if (!hash[object]) hash[object] = {}
      return
    }

    if (Array.isArray(object)) {
      for (const item of object) this._include(hash, item)
      return
    }

    for (const key of Object.keys(object)) {
      if (!hash[key]) hash[key] = {}
      this._include(hash[key], object[key])
    }
  }

  select (...columns) {
    for (let column of columns) {
      if (Array.isArray(column)) {
        column = new Raw(column[0], column.slice(1))
      } else if (this.model.table[column] instanceof Column) {
        column = this.model.table[column]
      }
      this.query = this.query.select(column)
    }
    return this
  }

  join (...args) {
    this._join(this.model, args)
    return this
  }

  leftJoin (...args) {
    this._join(this.model, args, 'left')
    return this
  }

  _join (model, name, type) {
    if (Array.isArray(name)) {
      for (const item of name) this._join(model, item, type)
      return
    }

    if (typeof name === 'object') {
      for (const key of Object.keys(name)) {
        this._join(model, key, type)
        this._join(model.relations[key].model, name[key], type)
      }
      return
    }

    let condition
    const relation = model.relations[name]

    if (relation.many) {
      condition = relation.model.table[relation.key].equals(model.table.id)
    } else {
      condition = model.table[relation.key].equals(relation.model.table.id)
    }

    const method = type === 'left' ? 'leftJoin' : 'join'
    this.from = this.from[method](relation.model.table).on(condition)
  }

  groupBy (sql, ...params) {
    this.query = this.query.group(new Raw(sql, params))
    return this
  }

  search (text) {
    return this.where(
      "search @@ to_tsquery('simple', ?)",
      text.split(/\s+/g).map((term) => `${term}:*`).join(' & ')
    )
  }
}

module.exports = Query
