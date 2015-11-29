'use strict'

const Node = require('sql/lib/node')

module.exports = Node.define({

  type: 'RAW',

  constructor: function (sql, values) {
    Node.call(this)
    this.sql = sql
    this.values = values
  }

})
