'use strict'

const {Pool} = require('pg')
const Model = require('./model')
const Connection = require('./connection')
const Transaction = require('./transaction')

// Monkey patch sql a bit
require('./sql')

class DB {
  constructor (url) {
    const db = this
    this.pool = new Pool({connectionString: url})
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
    this.pool.end()
  }

  query (...args) {
    this.log(args)
    return this.pool.query(...args)
  }

  transaction () {
    return new Transaction(this)
  }
}

module.exports = DB
