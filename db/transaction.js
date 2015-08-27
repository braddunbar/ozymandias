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

  commit () {
    return this.connect().then(function (connection) {
      this.query('commit')
      return Promise.all(this.promises).then(function (value) {
        connection.close()
        return value
      }).catch(function (e) {
        connection.close()
        throw e
      })
    }.bind(this))
  }

  run (body) {
    if (this.db._transaction) {
      throw new Error('already running a transaction')
    }
    this.db._transaction = this
    try {
      return body()
    } catch (e) {
      let promise = Promise.reject(e)
      this.promises.push(promise)
      return promise
    } finally {
      this.db._transaction = null
    }
  }

}

module.exports = Transaction
