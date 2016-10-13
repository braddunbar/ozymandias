'use strict'

const test = require('./test')
const {SECURE} = process.env

test('redirect from http to https when enabled', function (t) {
  process.env.SECURE = '1'
  t.app.use(function *() { this.status = 200 })

  t.agent.get('/')
  .set('x-forwarded-proto', 'http')
  .expect(302)
  .end(t.end)
})

test('pass through https to next handler when enabled', function (t) {
  process.env.SECURE = '1'
  t.app.use(function *() { this.status = 200 })

  t.agent.get('/')
  .set('x-forwarded-proto', 'https')
  .expect(200)
  .end(t.end)
})

test('pass through http when disabled', function (t) {
  process.env.SECURE = null
  t.app.use(function *() { this.status = 200 })

  t.agent.get('/')
  .set('x-forwarded-proto', 'http')
  .expect(200)
  .end(t.end)
})

test('pass through https when disabled', function (t) {
  process.env.SECURE = null
  t.app.use(function *() { this.status = 200 })

  t.agent.get('/')
  .set('x-forwarded-proto', 'https')
  .expect(200)
  .end(t.end)
})

test('Be sure to restore SECURE', function (t) {
  process.env.SECURE = SECURE
  t.end()
})
