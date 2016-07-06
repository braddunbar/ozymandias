'use strict'

class Transaction {

  constructor (db) {
    this.db = db
  }

  connect () {
    this.started = true
    if (!this.connection) {
      this.connection = this.db.connect().then((connection) => {
        connection.query('begin')
        return connection
      })
    }
    return this.connection
  }

  query (query, values) {
    if (this.closed) throw new Error('cannot query a closed transaction')
    return this.connect().then((connection) => connection.query(query, values))
  }

  close (query) {
    this.closed = true
    if (!this.started) return Promise.resolve()
    return this.connect().then((connection) => {
      return connection.query(query).then((value) => {
        connection.close()
        return value
      }).catch((e) => {
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

}

module.exports = Transaction
