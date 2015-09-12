'use strict'

let Table = require('sql/lib/table')
let Query = require('sql/lib/node/query')
let Postgres = require('sql/lib/dialect/postgres')
let Parameter = require('sql/lib/node/parameter')

// Fill in some missing table methods.
for (let method of ['limit', 'offset', 'order']) {
  Table.prototype[method] = function () {
    let query = new Query(this)
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

let visit = Postgres.prototype.visit
Postgres.prototype.visit = function (node) {
  if (node.type !== 'RAW') return visit.apply(this, arguments)

  let i = 0
  let result = ''

  for (let sql of node.sql.split('?')) {
    result += sql
    let value = node.values[i++]
    if (value) result += this.visit(new Parameter(value))
  }

  return result
}
