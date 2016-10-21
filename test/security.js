'use strict'

const test = require('./test')

test('redirect from http to https', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'http')
    .send()

  response.expect(302).expect('location', 'https://localhost/')
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

test('HSTS headers regardless of content type', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() {
    this.status = 200
    this.body = this.accepts('html') ? '' : {}
  })

  const html = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .accept('text/html')
    .send()

  html
    .expect(200)
    .expect('strict-transport-security', 'max-age=2592000; includeSubDomains')

  const json = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .accept('application/json')
    .send()

  json
    .expect(200)
    .expect('strict-transport-security', 'max-age=2592000; includeSubDomains')
})

test('security headers', function *(assert, {app, client}) {
  app.use(function *() { this.status = 200 })

  const response = yield client.get('/').send()
  response
    .expect(200)
    .expect('x-frame-options', 'SAMEORIGIN')
    .expect('x-xss-protection', '1; mode=block')
    .expect('x-content-type-options', 'nosniff')
    .expect('content-security-policy', /img-src[^;]+'self'/)
    .expect('content-security-policy', /frame-src[^;]+'self'/)
    .expect('content-security-policy', /style-src[^;]+'self'/)
    .expect('content-security-policy', /script-src[^;]+'self'/)
    .expect('content-security-policy', /connect-src[^;]+'self'/)
    .expect('content-security-policy', /default-src[^;]+'self'/)
    .expect('content-security-policy', /img-src[^;]+https:\/\/www.google-analytics.com/)
    .expect('content-security-policy', /script-src[^;]+https:\/\/www.google-analytics.com/)
})
