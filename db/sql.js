'use strict'

let Table = require('sql/lib/table')
let Postgres = require('sql/lib/dialect/postgres')
let Query = require('sql/lib/node/query')

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
