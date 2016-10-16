'use strict'

const test = require('./test')
const User = require('../user')

test('no user', function *(t, {app, client}) {
  app.context.User = User
  app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, false)
    t.is(currentUser, null)
    this.status = 200
  })
  const response = yield client.get('/').send()
  response.expect(200)
  t.end()
})

test('fetch a user', function *(t, {app, client}) {
  app.context.User = User
  app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, true)
    t.is(currentUser.id, 1)
    this.status = 200
  })

  const signin = yield client
    .post('/session')
    .send({email: 'brad@example.com', password: 'password'})
  signin.expect(200)

  const response = yield client.get('/').send()
  response.expect(200)
  t.end()
})

test('fetch a non-admin user', function *(t, {app, client}) {
  app.context.User = User
  app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, false)
    t.is(currentUser.id, 3)
    this.status = 200
  })

  const signin = yield client
    .post('/session')
    .send({email: 'jd@example.com', password: 'password'})
  signin.expect(200)
  const response = yield client.get('/').send()
  response.expect(200)
  t.end()
})
