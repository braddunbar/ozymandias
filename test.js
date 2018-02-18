'use strict'

const db = require('./db/instance')
const tape = require('tape')
const Client = require('test-client')
const Browser = require('./browser')

module.exports = (App) => (name, test) => tape(name, async (assert) => {
  const app = App()
  const browser = new Browser(app)

  // Set up transactions.
  const transaction = db.transaction()
  db.query = transaction.query.bind(transaction)

  const client = new Client(app)

  client.signIn = async (email) => {
    const response = await client.post('/session').send({email, password: 'password'})
    response.assert(200)
  }

  try {
    await test({app, assert, browser, client})
    assert.end()
  } catch (error) {
    assert.end(error)
  } finally {
    browser.close()
    transaction.rollback()
  }
})
