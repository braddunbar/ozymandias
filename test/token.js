'use strict'

const test = require('./test')
const Token = require('../token')

test('creating a token assigns an id', function *(t) {
  const token = yield Token.create({userId: 1, expiresAt: new Date()})
  t.ok(token.id)
  t.end()
})

test('creating a token with an id still works', function *(t) {
  const token = yield Token.create({
    id: '41b53fed0c7e2634b9c7e5ff2afb297517a278c0',
    userId: 1,
    expiresAt: new Date()
  })
  t.is(token.id, '41b53fed0c7e2634b9c7e5ff2afb297517a278c0')
  t.end()
})
