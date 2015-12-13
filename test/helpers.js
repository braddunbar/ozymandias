'use strict'

const app = require('../')()
const test = require('./test')
const request = require('supertest')
const helpers = require('../helpers')

app.set('views', 'test/views')

app.get('/error', (req, res) => {
  res.error({stack: 'test stack'})
})

test('res.error', (t) => {
  request(app)
  .get('/error')
  .expect('layout 500\n\n')
  .expect(500)
  .end(t.end)
})

test('locals.req === req', (t) => {
  let req = {}
  let res = {locals: {}}
  helpers(req, res, () => {
    t.is(res.locals.req, req)
    t.end()
  })
})

test('req.permit', (t) => {
  let req = {body: {id: 1, name: 'test', count: 25}}
  let res = {locals: {}}
  helpers(req, res, () => {
    t.deepEqual(req.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    t.end()
  })
})

test('res.locals.json', (t) => {
  let req = {}
  let res = {locals: {}}
  helpers(req, res, () => {
    let expected = `<script type='application/json' id='test'>{"test":"<\\/script>alert(\\"O_o\\")<\\/script>"}</script>`
    t.is(res.locals.json('test', {test: '</script>alert("O_o")</script>'}), expected)
    t.end()
  })
})

test('res.locals.json handles undefined', (t) => {
  let req = {}
  let res = {locals: {}}
  helpers(req, res, () => {
    let expected = `<script type='application/json' id='test'>null</script>`
    t.is(res.locals.json('test', undefined), expected)
    t.end()
  })
})

test('signIn/signOut', (t) => {
  const req = {session: {}}
  const res = {locals: {}}
  helpers(req, res, () => {
    req.signIn({id: 1})
    t.is(req.session.userId, 1)
    req.signOut()
    t.is(req.session.userId, undefined)
    t.end()
  })
})
