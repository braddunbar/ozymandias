'use strict'

let pg = require('pg')
let sql = require('sql')
let Model = require('./model')
let Connection = require('./connection')
let Transaction = require('./transaction')

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

  log () {
    // Overwritten by child classes.
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
      }).catch(function (e) {
        connection.close()
        throw e
      })
    })
  }

  transaction (body) {
    let transaction = new Transaction(this)
    if (!body) return transaction
    return transaction.run(body).then(function () {
      return transaction.commit()
    }).catch(function (e) {
      return transaction.rollback().then(function () {
        if (e.message !== 'rollback') throw e
      })
    })
  }

  call (name, args) {
    let creator = sql.functionCallCreator(name)
    return creator.apply(creator, args)
  }

}

module.exports = DB
