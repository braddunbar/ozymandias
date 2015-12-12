'use strict'

const test = require('./test')
const Token = require('../token')

test('creating a token assigns an id', (t) => {
  Token.create({user_id: 1, expires_at: new Date()}).then((token) => {
    t.ok(token.id)
    t.end()
  }).catch(t.end)
})

test('creating a token with an id still works', (t) => {
  Token.create({
    id: '41b53fed0c7e2634b9c7e5ff2afb297517a278c0',
    user_id: 1,
    expires_at: new Date()
  }).then((token) => {
    t.is(token.id, '41b53fed0c7e2634b9c7e5ff2afb297517a278c0')
    t.end()
  }).catch(t.end)
})
