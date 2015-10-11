'use strict'

let ozy = require('../')
let test = require('tape')
let request = require('supertest')

const SECURE = process.env.SECURE

test('redirect from http to https when enabled', function (t) {
  process.env.SECURE = '1'

  let app = ozy()
  app.get('/', function (req, res) { res.status(500).end() })

  request(app).get('/')
  .set('x-forwarded-proto', 'http')
  .expect(302)
  .end(t.end)
})

test('pass through https to next handler when enabled', function (t) {
  process.env.SECURE = '1'

  let app = ozy()
  app.get('/', function (req, res) { res.end('ok') })

  request(app).get('/')
  .set('x-forwarded-proto', 'https')
  .expect(200)
  .expect('ok')
  .end(t.end)
})

test('pass through http when disabled', function (t) {
  process.env.SECURE = null

  let app = ozy()
  app.get('/', function (req, res) { res.end('ok') })

  request(app).get('/')
  .set('x-forwarded-proto', 'http')
  .expect(200)
  .expect('ok')
  .end(t.end)
})

test('pass through https when disabled', function (t) {
  process.env.SECURE = null

  let app = ozy()
  app.get('/', function (req, res) { res.end('ok') })

  request(app).get('/')
  .set('x-forwarded-proto', 'https')
  .expect(200)
  .expect('ok')
  .end(t.end)
})

test('Be sure to restore SECURE', function (t) {
  process.env.SECURE = SECURE
  t.end()
})
