'use strict'

const test = require('./test')

test('redirect from http to https', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'http')
    .send()

  response.assert(302).assert('location', 'https://localhost/')
})

test('pass through https to next handler', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.status = 200 })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()

  response.assert(200)
})

test('HSTS headers for HTML response', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.body = '' })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()

  response
    .assert(200)
    .assert('strict-transport-security', 'max-age=31557600; includeSubDomains; preload')
})

test('HSTS headers for JSON response', function *(assert, {app, client}) {
  app.env = 'production'
  app.use(function *() { this.body = {} })

  const response = yield client
    .get('/')
    .set('x-forwarded-proto', 'https')
    .send()

  response
    .assert(200)
    .assert('strict-transport-security', 'max-age=31557600; includeSubDomains; preload')
})

test('security headers for HTML response', function *(assert, {app, client}) {
  app.use(function *() { this.body = '<!doctype html>' })

  const response = yield client.get('/').send()
  response
    .assert(200)
    .assert('x-frame-options', 'SAMEORIGIN')
    .assert('x-xss-protection', '1; mode=block')
    .assert('x-content-type-options', 'nosniff')
    .assert('content-security-policy', /img-src[^;]+'self'/)
    .assert('content-security-policy', /frame-src[^;]+'self'/)
    .assert('content-security-policy', /style-src[^;]+'self'/)
    .assert('content-security-policy', /script-src[^;]+'self'/)
    .assert('content-security-policy', /connect-src[^;]+'self'/)
    .assert('content-security-policy', /default-src[^;]+'self'/)
    .assert('content-security-policy', /img-src[^;]+https:\/\/www.google-analytics.com/)
    .assert('content-security-policy', /script-src[^;]+https:\/\/www.google-analytics.com/)
})

test('security headers for JSON response', function *(assert, {app, client}) {
  app.use(function *() { this.body = {} })

  const response = yield client.get('/').send()
  response
    .assert(200)
    .assert('x-frame-options', undefined)
    .assert('x-xss-protection', undefined)
    .assert('x-content-type-options', undefined)
    .assert('content-security-policy', undefined)
})

test('secure cookies for https responses', function *(assert, {app, client}) {
  app.use(function *() {
    this.cookies.set('x', 'y')
    this.body = ''
  })

  const response = yield client.get('/').set('x-forwarded-proto', 'https').send()
  response
    .assert(200)
    .assert('set-cookie', /secure/)
})

test('include a referrer policy in HTML responses', function *(assert, {app, client}) {
  app.use(function *() { this.body = '<!doctype html>' })

  const response = yield client.get('/').send()
  response
    .assert(200)
    .assert('referrer-policy', 'strict-origin-when-cross-origin')
})
