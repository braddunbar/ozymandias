'use strict'

let pg = require('pg')
let sql = require('sql')
let Model = require('./model')
let Connection = require('./connection')
let Transaction = require('./transaction')

class DB {

  constructor (url) {
    this.url = url
  }

  define (props) {
    class Child extends Model {}

    let table = sql.define({name: props.tableName, columns: props.columns})
    Child.db = props.db = this
    Child.table = props.table = table
    Child.columns = props.columns = {}
    Child.relations = props.relations = {}
    Child.properties = props.properties = {}

    // Columns and Properties
    for (let column of table.columns) {
      Child.columns[column.name] = column
      Child.properties[column.property] = column
    }

    // Prototype props
    for (let key in props) {
      let descriptor = Object.getOwnPropertyDescriptor(props, key)
      Object.defineProperty(Child.prototype, key, descriptor)
    }

    // Getters and Setters
    for (let column of table.columns) {
      if (Object.getOwnPropertyDescriptor(Child.prototype, column.property)) {
        continue
      }
      Object.defineProperty(Child.prototype, column.property, {
        get: function () { return this.data.get(column.name) },
        set: function (value) { this.data.set(column.name, value) }
      })
    }

    return Child
  }

  connect () {
    return Connection.create(this)
  }

  close () {
    pg.end()
  }

  query (query) {
    if (this._transaction) return this._transaction.query(query)
    return this.connect().then(function (connection) {
      return connection.query(query).then(function (result) {
        connection.close()
        return result
      })
    })
  }

  transaction (body) {
    let transaction = new Transaction(this)
    if (!body) return transaction
    try {
      transaction.run(body)
      return transaction.commit()
    } catch (e) {
      if (e.message === 'rollback') return transaction.rollback()
      return transaction.rollback().then(function () { throw e })
    }
  }

}

module.exports = DB
