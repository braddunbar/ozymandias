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
    return new Promise((resolve, reject) => {
      this.client.query(...args, (error, result) => {
        error ? reject(error) : resolve(result)
      })
    })
  }

  static async create (db) {
    return new Connection(db, await db.pool.connect())
  }
}

module.exports = Connection
