'use strict'

const test = require('./test')

test('redirect from http to https', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'http')
    .send()

  response
    .expect(302)
    .expect('location', 'https://localhost/')
})

test('pass through https to next handler', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()
  response.expect(200)
})

test('security headers', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client.get('/').send()
  response
    .expect(302)
    .expect('x-frame-options', 'SAMEORIGIN')
    .expect('x-xss-protection', '1; mode=block')
    .expect('x-content-type-options', 'nosniff')
    .expect('strict-transport-security', 'max-age: 86400000; includeSubdomains')
})
