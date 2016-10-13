'use strict'

const test = require('./test')
const React = require('react')
const {get} = require('koa-route')

test('render state as json', (t) => {
  t.app.use(get('/', function *() {
    this.react({x: 1})
  }))

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

  t.app.use(get('/', function *() {
    this.react({x: 1})
    t.deepEqual(this.state.state, {
      x: 1,
      path: '/',
      statusCode: 404,
      url: '/?x=1',
      version: '99914b932bd37a50b983c5e7c90ae93b'
    })
  }))

  t.agent
  .get('/?x=1')
  .set('Accept', 'text/html')
  .expect(`<div id='root'><em data-reactroot="" data-reactid="1" data-react-checksum="1647120041">1</em></div>`)
  .end(t.end)
})
