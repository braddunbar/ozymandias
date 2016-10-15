'use strict'

const test = require('./test')
const User = require('../user')
const Token = require('../token')

test('POST /session: Can sign in with correct password', (t) => {
  t.agent
  .post('/session')
  .send({
    email: 'brad@example.com',
    password: 'password'
  })
  .expect(200, {})
  .end(t.end)
})

test('POST /session: Handles mixed case and leading/trailing space', (t) => {
  t.agent
  .post('/session')
  .send({
    email: '  Brad@Example.com  ',
    password: 'password'
  })
  .expect(200, {})
  .end(t.end)
})

test('POST /session: Cannot sign in with incorrect password', (t) => {
  t.agent
  .post('/session')
  .send({
    email: 'brad@example.com',
    password: 'incorrect'
  })
  .expect(422, {password: ['Sorry! That password is incorrect.']})
  .end(t.end)
})

test('POST /session: Cannot sign in with missing user', (t) => {
  t.agent
  .post('/session')
  .send({
    email: 'missing@example.com',
    password: 'password'
  })
  .expect(422, {email: ['Sorry! We don’t recognize that email.']})
  .end(t.end)
})

test('DELETE /session is a 200', (t) => {
  t.agent
  .delete('/session')
  .expect(200, {})
  .end(t.end)
})

test('GET /session/reset/<tokenId>: 200 for missing token', (t) => {
  t.agent
  .get('/session/reset/missing')
  .set('Accept', 'application/json')
  .expect(200)
  .end((error, {body}) => {
    if (error) return t.end(error)
    t.ok(!body.token)
    t.ok(!body.email)
    t.end()
  })
})

test('GET /session/reset/<tokenId>: 200 for expired token', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() - 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .get(`/session/reset/${token.id}`)
  .set('Accept', 'application/json')
  .expect(200)
  .end((error, {body}) => {
    if (error) return t.end(error)
    t.ok(!body.token)
    t.ok(!body.email)
    t.end()
  })
})

test('GET /session/reset/<tokenId>: 200 for valid token', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .get(`/session/reset/${token.id}`)
  .set('Accept', 'application/json')
  .expect(200)
  .end((error, {body}) => {
    if (error) return t.end(error)
    t.is(body.token, token.id)
    t.is(body.email, 'brad@example.com')
    t.end()
  })
})

test('POST /session/reset/<tokenId>: 422 for missing token', function *(t) {
  t.agent
  .post('/session/reset/missing')
  .expect(422, {password: ['Sorry! That token is expired.']})
  .end(t.end)
})

test('POST /session/reset/<tokenId>: 422 for expired token', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() - 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .post(`/session/reset/${token.id}`)
  .expect(422, {password: ['Sorry! That token is expired.']})
  .end((error, response) => {
    if (error) return t.end(error)
    User.find(1).then((user) => (
      user.authenticate('password').then((match) => {
        t.ok(match)
        t.end()
      })
    )).catch(t.end)
  })
})

test('POST /session/reset/<tokenId>: 422 for missing password', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .post(`/session/reset/${token.id}`)
  .expect(422, {password: ['You must provide a password.']})
  .end((error, response) => {
    if (error) return t.end(error)
    User.find(1).then((user) => (
      user.authenticate('password').then((match) => {
        t.ok(match)
        t.end()
      })
    )).catch(t.end)
  })
})

test('POST /session/reset/<tokenId>: 422 for invalid password', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .post(`/session/reset/${token.id}`)
  .send({password: 'short'})
  .expect(422, {password: ['Password must be at least eight characters long']})
  .end((error, response) => {
    if (error) return t.end(error)
    User.find(1).then((user) => (
      user.authenticate('password').then((match) => {
        t.ok(match)
        t.end()
      })
    )).catch(t.end)
  })
})

test('POST /session/reset/<tokenId>: 200 for valid token', function *(t) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 5)

  const token = yield Token.create({expiresAt, userId: 1})

  t.agent
  .post(`/session/reset/${token.id}`)
  .send({password: 'newpassword'})
  .expect(200, {})
  .end((error, response) => {
    if (error) return t.end(error)
    User.find(1).then((user) => (
      user.authenticate('newpassword').then((match) => {
        t.ok(match)
        t.end()
      })
    )).catch(t.end)
  })
})

test('POST /session/forgot:  422 for missing emails', (t) => {
  t.agent
  .post('/session/forgot')
  .send({email: 'missing@example.com'})
  .expect(422, {email: ['Sorry! We don’t recognize that email.']})
  .end(t.end)
})

test('POST /session/forgot: 200 for valid emails', (t) => {
  t.agent
  .post('/session/forgot')
  .send({email: '  Brad@Example.com  '})
  .expect(200, {})
  .end((error) => {
    if (error) return t.end(error)
    Token.where({userId: 1}).find().then((token) => {
      t.ok(token.expiresAt > new Date())
      t.end()
    }).catch(t.end)
  })
})
