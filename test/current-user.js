'use strict'

const test = require('./test')
const User = require('../user')

test('no user', (t) => {
  t.app.context.User = User
  t.app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, false)
    t.is(currentUser, null)
    this.status = 200
  })
  t.agent.get('/').end(t.end)
})

test('fetch a user', (t) => {
  t.app.context.User = User
  t.app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, true)
    t.is(currentUser.id, 1)
    this.status = 200
  })

  t.agent.post('/session')
  .send({email: 'brad@example.com', password: 'password'})
  .expect(200)
  .end((error) => {
    if (error) return t.end(error)
    t.agent.get('/').end(t.end)
  })
})

test('fetch a non-admin user', (t) => {
  t.app.context.User = User
  t.app.use(function *() {
    const {admin, currentUser} = this.state
    t.is(admin, false)
    t.is(currentUser.id, 3)
    this.status = 200
  })

  t.agent.post('/session')
  .send({email: 'jd@example.com', password: 'password'})
  .expect(200)
  .end((error) => {
    if (error) return t.end(error)
    t.agent.get('/').end(t.end)
  })
})
