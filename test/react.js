'use strict'

const test = require('./test')
const React = require('react')

test('render state as json', (t) => {
  t.app.use(function *() {
    this.react({x: 1})
  })

  t.agent
  .get('/?x=1')
  .set('Accept', 'application/json')
  .expect(200, {
    x: 1,
    path: '/',
    statusCode: 404,
    url: '/?x=1',
    version: '99914b932bd37a50b983c5e7c90ae93b'
  })
  .end(t.end)
})

test('render state as HTML', (t) => {
  t.app.context.client = ({x}) => React.createElement('em', {}, x)

  t.app.use(function *() {
    this.react({x: 1})
    t.deepEqual(this.state.state, {
      x: 1,
      path: '/',
      statusCode: 404,
      url: '/?x=1',
      version: '99914b932bd37a50b983c5e7c90ae93b'
    })
  })

  t.agent
  .get('/?x=1')
  .set('Accept', 'text/html')
  .expect(`<div id='root'><em data-reactroot="" data-reactid="1" data-react-checksum="1647120041">1</em></div>`)
  .end(t.end)
})

test('return html for browser accept value', (t) => {
  t.app.use(function *() { this.react() })

  t.agent.get('/')
  .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
  .expect('content-type', /html/)
  .expect(200)
  .end(t.end)
})

test('toJSON', (t) => {
  t.app.context.client = ({x}) => {
    t.is(x, 1)
    return null
  }

  t.app.use(function *() {
    this.react({x: {toJSON () { return 1 }}})
    t.is(this.state.state.x, 1)
  })

  t.agent.get('/').expect(200).end(t.end)
})
