'use strict'

const app = require('../')()
const test = require('./test')
const request = require('supertest')
const helpers = require('../helpers')

app.set('views', 'test/views')

app.get('/500', (req, res) => {
  res.error(new Error('test'))
})

app.get('/422', (req, res) => {
  const error = new Error('invalid')
  error.model = {errors: {x: 1}}
  res.error(error)
})

test('res.error 500', (t) => {
  request(app)
  .get('/500')
  .set('Content-Type', 'application/json')
  .expect(500)
  .end(t.end)
})

test('res.error 422', (t) => {
  request(app)
  .get('/422')
  .expect({x: 1})
  .expect(422)
  .end(t.end)
})

test('locals.req === req', (t) => {
  const req = {}
  const res = {locals: {}}
  helpers(req, res, () => {
    t.is(res.locals.req, req)
    t.end()
  })
})

test('req.permit', (t) => {
  const req = {body: {id: 1, name: 'test', count: 25}}
  const res = {locals: {}}
  helpers(req, res, () => {
    t.deepEqual(req.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    t.end()
  })
})

test('req.permit allows explicitly null values', (t) => {
  const req = {body: {street: null}}
  const res = {locals: {}}
  helpers(req, res, () => {
    t.deepEqual(req.permit('street'), {street: null})
    t.end()
  })
})

test('res.locals.json', (t) => {
  const req = {}
  const res = {locals: {}}
  helpers(req, res, () => {
    const expected =
      `<script type='application/json' id='id'>"</<!-<\\u0021--<\\/script<\\u0021--<\\/script"</script>`
    t.is(res.locals.json('id', '</<!-<!--</script<!--</script'), expected)
    t.end()
  })
})

test('res.locals.json handles undefined', (t) => {
  const req = {}
  const res = {locals: {}}
  helpers(req, res, () => {
    const expected = "<script type='application/json' id='test'>null</script>"
    t.is(res.locals.json('test', undefined), expected)
    t.end()
  })
})

test('signIn/signOut', (t) => {
  const req = {session: {}}
  const res = {locals: {}}
  helpers(req, res, () => {
    req.signIn(null)
    t.is(req.session.userId, undefined)
    req.signIn({id: 1})
    t.is(req.session.userId, 1)
    req.signOut()
    t.is(req.session, null)
    t.end()
  })
})
