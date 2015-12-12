'use strict'

const pg = require('pg')
const Model = require('./model')
const Connection = require('./connection')
const Transaction = require('./transaction')

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

  transaction () {
    return new Transaction(this)
  }

}

module.exports = DB
