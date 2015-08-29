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

  query (query) {
    let client = this.client
    if (query.toQuery) query = query.toQuery()
    this.db.log(query)
    return new Promise(function (resolve, reject) {
      client.query(query, function (e, result) {
        if (e) reject(e)
        else resolve(result)
      })
    })
  }

  static create (db) {
    return new Promise(function (resolve, reject) {
      pg.connect(db.url, function (e, client, done) {
        if (e) reject(e)
        else resolve(new Connection(db, client, done))
      })
    })
  }

}

module.exports = Connection
