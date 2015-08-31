'use strict'

let test = require('tape')
let helpers = require('../helpers')

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
    t.deepEqual(req.permit('name', 'count'), {name: 'test', count: 25})
    t.end()
  })
})
