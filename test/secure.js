'use strict'

const test = require('./test')
const {SECURE} = process.env

test('redirect from http to https when enabled', function *(t, {client}) {
  process.env.SECURE = '1'
  t.app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'http')
    .send()
  response.expect(302)
})

test('pass through https to next handler when enabled', function *(t, {client}) {
  process.env.SECURE = '1'
  t.app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()
  response.expect(200)
})

test('pass through http when disabled', function *(t, {client}) {
  process.env.SECURE = null
  t.app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'http')
    .send()
  response.expect(200)
})

test('pass through https when disabled', function *(t, {client}) {
  process.env.SECURE = null
  t.app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()
  response.expect(200)
})

test('Be sure to restore SECURE', function *(t) {
  process.env.SECURE = SECURE
})
