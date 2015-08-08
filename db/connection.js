'use strict'

let pg = require('pg')

class Connection {

  constructor (client, done) {
    this.client = client
    this.done = done
  }

  close () {
    this.done()
  }

  query (query) {
    let client = this.client
    if (query.toQuery) query = query.toQuery()
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
        else resolve(new Connection(client, done))
      })
    })
  }

}

module.exports = Connection
