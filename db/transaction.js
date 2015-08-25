'use strict'

class Transaction {

  constructor (db, options) {
    this.db = db
    this.queries = []
  }

  add (query) {
    return new Promise(function (resolve, reject) {
      this.queries.push({
        query: query,
        reject: reject,
        resolve: resolve
      })
    }.bind(this))
  }

  execute () {
    return this.db.connect().then(this.query.bind(this))
  }

  query (connection) {
    let promises = [connection.query('begin')]

    for (let query of this.queries) {
      promises.push(connection.query(query.query).then(function (result) {
        query.resolve(result)
        return result
      }).catch(function (e) {
        query.reject(e)
        throw e
      }))
    }

    promises.push(connection.query('commit'))

    return Promise.all(promises).then(function () {
      connection.close()
    }).catch(function (e) {
      connection.close()
      throw e
    })
  }

}

module.exports = Transaction
