'use strict'

class Transaction {

  constructor (db) {
    this.db = db
    this.promises = []
  }

  connect () {
    if (this._connect) return this._connect
    this._connect = this.db.connect().then((connection) => {
      this.promises.push(connection.query('begin'))
      return connection
    })
    return this._connect
  }

  query (query, values) {
    if (this.closed) {
      throw new Error('cannot query a closed transaction')
    }
    let promise = this.connect().then(function (connection) {
      return connection.query(query, values)
    })
    this.promises.push(promise)
    return promise
  }

  close (query) {
    this.closed = true
    return this.connect().then((connection) => {
      this.promises.push(connection.query(query))
      return Promise.all(this.promises).then(function (value) {
        connection.close()
        return value
      }).catch(function (e) {
        connection.close()
        throw e
      })
    })
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
    } catch (e) {
      return Promise.reject(e)
    } finally {
      this.db._transaction = null
    }
  }

}

module.exports = Transaction
