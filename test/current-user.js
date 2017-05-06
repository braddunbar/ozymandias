'use strict'

const test = require('./test')
const User = require('../user')

test('no user', async ({assert, app, client}) => {
  app.context.User = User
  app.use(async (_) => {
    assert.is(_.state.admin, false)
    assert.is(_.state.currentUser, null)

    assert.is(_.state.client.admin, false)
    assert.is(_.state.client.currentUser, null)

    _.status = 200
  })
  const response = await client.get('/').send()
  response.assert(200)
})

test('fetch a user', async ({assert, app, client}) => {
  app.context.User = User
  app.use(async (_) => {
    assert.is(_.state.admin, true)
    assert.is(_.state.currentUser.id, 1)

    assert.is(_.state.client.admin, true)
    assert.is(_.state.client.currentUser.id, 1)

    _.status = 200
  })

  const signin = await client
    .post('/session')
    .send({email: 'brad@example.com', password: 'password'})
  signin.assert(200)

  const response = await client.get('/').send()
  response.assert(200)
})

test('fetch a non-admin user', async ({assert, app, client}) => {
  app.context.User = User
  app.use(async (_) => {
    assert.is(_.state.admin, false)
    assert.is(_.state.currentUser.id, 3)

    assert.is(_.state.client.admin, false)
    assert.is(_.state.client.currentUser.id, 3)

    _.status = 200
  })

  const signin = await client
    .post('/session')
    .send({email: 'jd@example.com', password: 'password'})
  signin.assert(200)
  const response = await client.get('/').send()
  response.assert(200)
})
