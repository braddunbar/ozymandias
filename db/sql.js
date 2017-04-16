'use strict'

const Postgres = require('sql/lib/dialect/postgres')
const Parameter = require('sql/lib/node/parameter')
const visit = Postgres.prototype.visit

Postgres.prototype.visit = function (node, ...args) {
  if (node.type !== 'RAW') return visit.call(this, node, ...args)

  let i = 0
  let result = ''

  for (let sql of node.sql.split('?')) {
    result += sql
    let value = node.values[i++]
    if (value) result += this.visit(new Parameter(value))
  }

  return result
}
