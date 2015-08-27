'use strict'

class Transaction {

  constructor (db) {
    this.db = db
    this.promises = []
  }

  connect () {
    if (this._connect) return this._connect
    this._connect = this.db.connect().then(function (connection) {
      this.promises.push(connection.query('begin'))
      return connection
    }.bind(this))
    return this._connect
  }

  query (query) {
    let promise = this.connect().then(function (connection) {
      return connection.query(query)
    })
    this.promises.push(promise)
    return promise
  }

  close (query) {
    return this.connect().then(function (connection) {
      this.query(query)
      return Promise.all(this.promises).then(function (value) {
        connection.close()
        return value
      }).catch(function (e) {
        connection.close()
        throw e
      })
    }.bind(this))
  }

  commit () {
    return this.close('commit')
  }

  rollback () {
    return this.close('rollback')
  }

  run (body) {
    if (this.db._transaction) {
      throw new Error('already running a transaction')
    }
    this.db._transaction = this
    try {
      return Promise.resolve(body())
    } finally {
      this.db._transaction = null
    }
  }

}

module.exports = Transaction
