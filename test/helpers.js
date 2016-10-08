'use strict'

const app = require('../')()
const test = require('./test')
const request = require('supertest')
const helpers = require('../helpers')

app.set('views', 'test/views')

app.get('/500', (request, response) => {
  response.error(new Error('test'))
})

app.get('/422', (request, response) => {
  const error = new Error('invalid')
  error.model = {errors: {x: 1}}
  response.error(error)
})

test('response.error 500', (t) => {
  request(app)
  .get('/500')
  .set('Content-Type', 'application/json')
  .expect(500)
  .end(t.end)
})

test('response.error 422', (t) => {
  request(app)
  .get('/422')
  .expect({x: 1})
  .expect(422)
  .end(t.end)
})

test('locals.request === request', (t) => {
  const request = {}
  const response = {locals: {}}
  helpers(request, response, () => {
    t.is(response.locals.request, request)
    t.end()
  })
})

test('request.permit', (t) => {
  const request = {body: {id: 1, name: 'test', count: 25}}
  const response = {locals: {}}
  helpers(request, response, () => {
    t.deepEqual(request.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    t.end()
  })
})

test('request.permit allows explicitly null values', (t) => {
  const request = {body: {street: null}}
  const response = {locals: {}}
  helpers(request, response, () => {
    t.deepEqual(request.permit('street'), {street: null})
    t.end()
  })
})

test('response.locals.json', (t) => {
  const request = {}
  const response = {locals: {}}
  helpers(request, response, () => {
    const expected =
      `<script type='application/json' id='id'>"</<!-<\\u0021--<\\/script<\\u0021--<\\/script"</script>`
    t.is(response.locals.json('id', '</<!-<!--</script<!--</script'), expected)
    t.end()
  })
})

test('response.locals.json handles undefined', (t) => {
  const request = {}
  const response = {locals: {}}
  helpers(request, response, () => {
    const expected = "<script type='application/json' id='test'>null</script>"
    t.is(response.locals.json('test', undefined), expected)
    t.end()
  })
})

test('signIn/signOut', (t) => {
  const request = {session: {}}
  const response = {locals: {}}
  helpers(request, response, () => {
    request.signIn(null)
    t.is(request.session.userId, undefined)
    request.signIn({id: 1})
    t.is(request.session.userId, 1)
    request.signOut()
    t.is(request.session, null)
    t.end()
  })
})
