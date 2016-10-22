'use strict'

const test = require('./test')
const User = require('../user')

test('no user', function *(assert, {app, client}) {
  app.context.User = User
  app.use(function *() {
    assert.is(this.state.admin, false)
    assert.is(this.state.currentUser, null)

    assert.is(this.state.client.admin, false)
    assert.is(this.state.client.currentUser, null)

    this.status = 200
  })
  const response = yield client.get('/').send()
  response.assert(200)
})

test('fetch a user', function *(assert, {app, client}) {
  app.context.User = User
  app.use(function *() {
    assert.is(this.state.admin, true)
    assert.is(this.state.currentUser.id, 1)

    assert.is(this.state.client.admin, true)
    assert.is(this.state.client.currentUser.id, 1)

    this.status = 200
  })

  const signin = yield client
    .post('/session')
    .send({email: 'brad@example.com', password: 'password'})
  signin.assert(200)

  const response = yield client.get('/').send()
  response.assert(200)
})

test('fetch a non-admin user', function *(assert, {app, client}) {
  app.context.User = User
  app.use(function *() {
    assert.is(this.state.admin, false)
    assert.is(this.state.currentUser.id, 3)

    assert.is(this.state.client.admin, false)
    assert.is(this.state.client.currentUser.id, 3)

    this.status = 200
  })

  const signin = yield client
    .post('/session')
    .send({email: 'jd@example.com', password: 'password'})
  signin.assert(200)
  const response = yield client.get('/').send()
  response.assert(200)
})
