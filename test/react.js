'use strict'

const test = require('./test')
const React = require('react')

test('render state as json', function *(t, {app, client}) {
  app.use(function *() {
    this.react({x: 1})
  })

  const response = yield client
    .get('/?x=1')
    .set('accept', 'application/json')
    .send()

  response.assert(200, {
    currentUser: null,
    admin: false,
    x: 1,
    path: '/',
    statusCode: 200,
    url: '/?x=1',
    version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
  })
})

test('render state as HTML', function *(t, {app, client}) {
  app.context.client = ({x}) => React.createElement('em', {}, x)

  app.use(function *() {
    this.react({x: 1})
    t.deepEqual(this.state.client, {
      currentUser: null,
      admin: false,
      x: 1,
      path: '/',
      statusCode: 200,
      url: '/?x=1',
      version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    })
  })

  const response = yield client
    .get('/?x=1')
    .set('Accept', 'text/html')
    .send()
  response.assert(200, `<div id='root'><em data-reactroot="" data-reactid="1" data-react-checksum="1647120041">1</em></div>`)
})

test('return html for browser accept value', function *(t, {app, client}) {
  app.use(function *() { this.react() })

  const response = yield client
    .get('/')
    .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .send()
  response.assert(200).assert('content-type', /html/)
})

test('toJSON', function *(t, {app, client}) {
  app.context.client = ({x}) => {
    t.is(x, 1)
    return null
  }

  app.use(function *() {
    this.react({x: {toJSON () { return 1 }}})
    t.is(this.state.client.x, 1)
  })

  const response = yield client.get('/').send()
  response.assert(200)
})

test('explicit 404 status', function *(t, {app, client}) {
  app.use(function *() {
    this.status = 404
    this.react()
    t.is(this.state.client.statusCode, 404)
  })
  const response = yield client.get('/').send()
  response.assert(404)
})

test('use context.state.client', function *(t, {app, client}) {
  app.use(function *() {
    this.state.client.x = 1
    this.react()
  })
  const response = yield client
    .get('/')
    .set('accept', 'application/json')
    .send()

  response.assert(200, {
    currentUser: null,
    admin: false,
    path: '/',
    statusCode: 200,
    url: '/',
    version: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
    x: 1
  })
})
