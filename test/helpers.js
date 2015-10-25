'use strict'

let app = require('../')()
let test = require('tape')
let request = require('supertest')
let helpers = require('../helpers')

app.set('views', 'test/views')

app.get('/error', function (req, res) {
  res.error({stack: 'test stack'})
})

test('res.error', function (t) {
  request(app)
  .get('/error')
  .expect('layout 500\n\n')
  .expect(500)
  .end(t.end)
})

test('locals.req === req', function (t) {
  let req = {}
  let res = {locals: {}}
  helpers(req, res, function () {
    t.is(res.locals.req, req)
    t.end()
  })
})

test('req.permit', function (t) {
  let req = {body: {id: 1, name: 'test', count: 25}}
  let res = {locals: {}}
  helpers(req, res, function () {
    t.deepEqual(req.permit('name', 'count', 'missing'), {
      name: 'test',
      count: 25
    })
    t.end()
  })
})

test('res.locals.json', function (t) {
  let req = {}
  let res = {locals: {}}
  helpers(req, res, function () {
    let expected = `<script type='application/json' id='test'>{"test":"<\\/script>alert(\\"O_o\\")"}</script>`
    t.is(res.locals.json('test', {test: '</script>alert("O_o")'}), expected)
    t.end()
  })
})
