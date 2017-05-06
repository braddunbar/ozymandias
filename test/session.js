'use strict'

const test = require('./test')
const User = require('../user')
const Token = require('../token')

test('POST /session: Can sign in with correct password', async (assert, {client}) => {
  const response = await client
    .post('/session')
    .send({
      email: 'brad@example.com',
      password: 'password'
    })
  response.assert(200, {})
})

test('POST /session: Handles mixed case and leading/trailing space', async (assert, {client}) => {
  const response = await client
    .post('/session')
    .send({
      email: '  Brad@Example.com  ',
      password: 'password'
    })
  response.assert(200, {})
})

test('POST /session: Cannot sign in with incorrect password', async (assert, {client}) => {
  const response = await client
    .post('/session')
    .send({
      email: 'brad@example.com',
      password: 'incorrect'
    })
  response.assert(422, {password: ['Sorry! That password is incorrect.']})
})

test('POST /session: Cannot sign in with missing user', async (assert, {client}) => {
  const response = await client
    .post('/session')
    .send({
      email: 'missing@example.com',
      password: 'password'
    })
  response.assert(422, {email: ['Sorry! We don’t recognize that email.']})
})

test('DELETE /session is a 200', async (assert, {client}) => {
  const response = await client.delete('/session').send()
  response.assert(200, {})
})

test('GET /session/reset/<tokenId>: 200 for missing token', async (assert, {client}) => {
  const response = await client
    .get('/session/reset/missing')
    .set('accept', 'application/json')
    .send()
  response.assert(200)
  assert.ok(!response.body.token)
  assert.ok(!response.body.email)
})

test('GET /session/reset/<tokenId>: 200 for expired token', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() - 5)

  const token = await Token.create({expiresAt, userId: 1})
  const response = await client
    .get(`/session/reset/${token.id}`)
    .set('Accept', 'application/json')
    .send()
  response.assert(200)
  assert.ok(!response.body.token)
  assert.ok(!response.body.email)
})

test('GET /session/reset/<tokenId>: 200 for valid token', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = await Token.create({expiresAt, userId: 1})
  const response = await client
    .get(`/session/reset/${token.id}`)
    .set('Accept', 'application/json')
    .send()
  response.assert(200)
  assert.is(response.body.token, token.id)
  assert.is(response.body.email, 'brad@example.com')
})

test('POST /session/reset/<tokenId>: 422 for missing token', async (assert, {client}) => {
  const response = await client.post('/session/reset/missing').send()
  response.assert(422, {password: ['Sorry! That token is expired.']})
})

test('POST /session/reset/<tokenId>: 422 for expired token', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() - 5)

  const token = await Token.create({expiresAt, userId: 1})
  const response = await client
    .post(`/session/reset/${token.id}`)
    .send()
  response.assert(422, {password: ['Sorry! That token is expired.']})
  assert.ok(await (await User.find(1)).authenticate('password'))
})

test('POST /session/reset/<tokenId>: 422 for missing password', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = await Token.create({expiresAt, userId: 1})

  const response = await client
    .post(`/session/reset/${token.id}`)
    .send()
  response.assert(422, {password: ['You must provide a password.']})
  assert.ok(await (await User.find(1)).authenticate('password'))
})

test('POST /session/reset/<tokenId>: 422 for invalid password', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = await Token.create({expiresAt, userId: 1})
  const response = await client
    .post(`/session/reset/${token.id}`)
    .send({password: 'short'})
  response.assert(422, {password: ['Password must be at least eight characters long']})
  assert.ok(await (await User.find(1)).authenticate('password'))
})

test('POST /session/reset/<tokenId>: 200 for valid token', async (assert, {client}) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = await Token.create({expiresAt, userId: 1})
  const response = await client
    .post(`/session/reset/${token.id}`)
    .send({password: 'newpassword'})
  response.assert(200, {})
  assert.ok(await (await User.find(1)).authenticate('newpassword'))
})

test('POST /session/forgot:  422 for missing emails', async (assert, {client}) => {
  const response = await client
    .post('/session/forgot')
    .send({email: 'missing@example.com'})
  response.assert(422, {email: ['Sorry! We don’t recognize that email.']})
})

test('POST /session/forgot: 200 for valid emails', async (assert, {client}) => {
  const response = await client
    .post('/session/forgot')
    .send({email: '  Brad@Example.com  '})
  response.assert(200, {})
  const token = await Token.where({userId: 1}).find()
  assert.ok(token.expiresAt > new Date())
})
