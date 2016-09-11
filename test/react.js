'use strict'

const test = require('./test')
const request = require('supertest')
const React = require('react')

const app = require('../')()
const view = (set, locals) => set(locals, 'foo', 'bar', 'x')

app.set('layout', (locals, content) => `layout ${content}`)
app.set('component', ({url, x}) => React.createElement('a', {href: url}, x))
app.set('layout.json', (set, {y}) => { set({y}) })

app.get('/react', (req, res) => {
  res.react(view, {
    foo: 1,
    bar: 2,
    x: req.query.x,
    y: 3
  })
})

test('render state as json', (t) => {
  request(app)
  .get('/react?x=y')
  .set('Accept', 'application/json')
  .expect({
    foo: 1,
    bar: 2,
    path: '/react',
    statusCode: 200,
    url: '/react?x=y',
    version: '99914b932bd37a50b983c5e7c90ae93b',
    x: 'y',
    y: 3
  })
  .end(t.end)
})

test('render state as HTML', (t) => {
  request(app)
  .get('/react?x=y')
  .set('Accept', 'text/html')
  .expect('layout <div id=\'root\'><a href="/react?x=y" data-reactroot="" data-reactid="1" data-react-checksum="2015761408">y</a></div>')
  .end(t.end)
})

app.get('/component', (req, res) => {
  req.component = () => React.createElement('a', {}, 'custom component')
  res.react(view, {})
})

test('use req.component if provided', (t) => {
  request(app)
  .get('/component')
  .set('Accept', 'text/html')
  .expect('layout <div id=\'root\'><a data-reactroot="" data-reactid="1" data-react-checksum="1290998820">custom component</a></div>')
  .end(t.end)
})

app.get('/nolocals', (req, res) => {
  res.react(view)
})

test('react without locals', (t) => {
  request(app)
  .get('/nolocals')
  .expect(200)
  .end(t.end)
})

app.get('/noview', (req, res) => {
  res.react()
})

test('react without a view', (t) => {
  request(app)
  .get('/noview')
  .expect(200)
  .end(t.end)
})
