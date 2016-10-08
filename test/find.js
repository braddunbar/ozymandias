'use strict'

const App = require('../')
const test = require('./test')
const User = require('./db/user')
const request = require('supertest')
const React = require('react')
const Router = require('../').Router

test('find a user', (t) => {
  const router = Router()
  router.find('user', () => User)
  router.get('/user/:userId', (request, response) => {
    t.ok(request.user != null)
    t.is(request.user.id, 1)
    t.ok(response.locals.user != null)
    t.is(response.locals.user.id, 1)
    response.end()
  })

  const app = App()
  app.use('/', router)

  request(app).get('/user/1').expect(200).end(t.end)
})

test('a missing user - HTML', (t) => {
  const router = Router()
  router.find('user', () => User)
  router.get('/user/:userId', (request, response) => {
    t.fail()
    response.end()
  })

  const app = App()
  app.use('/', router)
  app.set('views', 'test/views')
  app.set('component', () => React.createElement('div'))

  request(app).get('/user/12345')
  .expect('Content-Type', /html/)
  .expect(404)
  .end(t.end)
})

test('a missing user - JSON', (t) => {
  const router = Router()
  router.find('user', () => User)
  router.get('/user/:userId', (request, response) => {
    t.fail()
    response.end()
  })

  const app = App()
  app.use('/', router)
  app.set('views', 'test/views')

  request(app)
  .get('/user/12345')
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/)
  .expect(404)
  .end(t.end)
})

test('explicit property and param', (t) => {
  const router = Router()
  router.find('userId', 'person', () => User)
  router.get('/user/:userId', (request, response) => {
    t.ok(request.person != null)
    t.is(request.person.id, 1)
    t.ok(response.locals.person != null)
    t.is(response.locals.person.id, 1)
    response.end()
  })

  const app = App()
  app.use('/', router)

  request(app).get('/user/1').expect(200).end(t.end)
})
