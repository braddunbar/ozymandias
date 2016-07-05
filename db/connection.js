'use strict'

class Connection {

  constructor (db, client) {
    this.db = db
    this.client = client
  }

  close () {
    this.client.release()
  }

  query (query, values) {
    if (query.toQuery) query = query.toQuery()
    this.db.log(query)
    return new Promise((resolve, reject) => {
      this.client.query(query, values, (e, result) => {
        e ? reject(e) : resolve(result)
      })
    })
  }

  static create (db) {
    return db.pool.connect().then((client) => new Connection(db, client))
  }

}

module.exports = Connection
