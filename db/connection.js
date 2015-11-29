'use strict'

let pg = require('pg')

class Connection {

  constructor (db, client, done) {
    this.db = db
    this.client = client
    this.done = done
  }

  close () {
    this.done()
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
    return new Promise((resolve, reject) => {
      pg.connect(db.url, (e, client, done) => {
        e ? reject(e) : resolve(new Connection(db, client, done))
      })
    })
  }

}

module.exports = Connection
