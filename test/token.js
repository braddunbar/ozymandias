'use strict'

const test = require('./test')
const Token = require('../token')

test('creating a token assigns an id', async ({assert}) => {
  const token = await Token.create({userId: 1, expiresAt: new Date()})
  assert.ok(token.id)
})
