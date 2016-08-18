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
  router.get('/user/:userId', (req, res) => {
    t.ok(req.user != null)
    t.is(req.user.id, 1)
    t.ok(res.locals.user != null)
    t.is(res.locals.user.id, 1)
    res.end()
  })

  const app = App()
  app.use('/', router)

  request(app).get('/user/1').expect(200).end(t.end)
})

test('a missing user - HTML', (t) => {
  const router = Router()
  router.find('user', () => User)
  router.get('/user/:userId', (req, res) => {
    t.fail()
    res.end()
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
  router.get('/user/:userId', (req, res) => {
    t.fail()
    res.end()
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
  router.get('/user/:userId', (req, res) => {
    t.ok(req.person != null)
    t.is(req.person.id, 1)
    t.ok(res.locals.person != null)
    t.is(res.locals.person.id, 1)
    res.end()
  })

  const app = App()
  app.use('/', router)

  request(app).get('/user/1').expect(200).end(t.end)
})
