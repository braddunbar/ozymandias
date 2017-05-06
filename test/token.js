'use strict'

const test = require('./test')
const Token = require('../token')

test('creating a token assigns an id', async ({assert}) => {
  const token = await Token.create({userId: 1, expiresAt: new Date()})
  assert.ok(token.id)
})

test('creating a token with an id still works', async ({assert}) => {
  const token = await Token.create({
    id: '41b53fed0c7e2634b9c7e5ff2afb297517a278c0',
    userId: 1,
    expiresAt: new Date()
  })
  assert.is(token.id, '41b53fed0c7e2634b9c7e5ff2afb297517a278c0')
})
