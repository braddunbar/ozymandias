'use strict'

let pg = require('pg')
let Model = require('./model')
let Connection = require('./connection')
let Transaction = require('./transaction')

// Monkey patch sql a bit
require('./sql')

class DB {

  constructor (url) {
    let db = this
    this.url = url
    this.Model = class DBModel extends Model {
      static get db () {
        return db
      }
    }
  }

  log () {}

  connect () {
    return Connection.create(this)
  }

  close () {
    pg.end()
  }

  query (query, values) {
    if (this._transaction) return this._transaction.query(query, values)
    return this.connect().then((connection) => {
      return connection.query(query, values).then((result) => {
        connection.close()
        return result
      }).catch((e) => {
        connection.close()
        throw e
      })
    })
  }

  transaction (body) {
    let transaction = new Transaction(this)
    if (!body) return transaction
    return transaction.run(body).then((result) => {
      return transaction.commit().then(() => result)
    }).catch((e) => {
      return transaction.rollback().then(() => {
        if (e.message !== 'rollback') throw e
      })
    })
  }

}

module.exports = DB
