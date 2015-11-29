'use strict'

const Postgres = require('sql/lib/dialect/postgres')
const Parameter = require('sql/lib/node/parameter')
const visit = Postgres.prototype.visit

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
