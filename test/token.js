'use strict'

const test = require('tape')
const Token = require('../token')
const db = require('../db/instance')

test('creating a token assigns an id', (t) => {
  db.transaction(() => {
    Token.create({user_id: 1, expires_at: new Date()}).then((token) => {
      t.ok(token.id)
      t.end()
    }).catch(t.end)
    throw new Error('rollback')
  }).catch(t.end)
})

test('creating a token with an id still works', (t) => {
  db.transaction(() => {
    Token.create({
      id: '41b53fed0c7e2634b9c7e5ff2afb297517a278c0',
      user_id: 1,
      expires_at: new Date()
    }).then((token) => {
      t.is(token.id, '41b53fed0c7e2634b9c7e5ff2afb297517a278c0')
      t.end()
    }).catch(t.end)
    throw new Error('rollback')
  }).catch(t.end)
})
