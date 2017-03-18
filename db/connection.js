'use strict'

class Connection {
  constructor (db, client) {
    this.db = db
    this.client = client
  }

  close () {
    this.client.release()
  }

  query (...args) {
    this.db.log(args)
    return this.client.query(...args)
  }

  static async create (db) {
    return new Connection(db, await db.pool.connect())
  }
}

module.exports = Connection
