'use strict'

const test = require('./test')
const request = require('supertest')
const React = require('react')

const app = require('../')()
app.set('views', 'test/views')
app.set('component', ({url, x}) => React.createElement('a', {href: url}, x))

app.get('/react', (req, res) => {
  res.react({
    foo: 1,
    bar: 2
  })
})

test('render state as json', (t) => {
  request(app)
  .get('/react?x=y')
  .set('Accept', 'application/json')
  .expect({
    foo: 1,
    bar: 2,
    x: 'y',
    path: '/react',
    url: '/react?x=y',
    version: '☃'
  })
  .end(t.end)
})

test('render state as HTML', (t) => {
  request(app)
  .get('/react?x=y')
  .set('Accept', 'text/html')
  .expect(`layout <div id='root'><a href="/react?x=y" data-reactroot="" data-reactid="1" data-react-checksum="2015761408">y</a></div>\n`)
  .end(t.end)
})

app.get('/component', (req, res) => {
  req.component = () => React.createElement('a', {}, 'custom component')
  res.react({})
})

test('use req.component if provided', (t) => {
  request(app)
  .get('/component')
  .set('Accept', 'text/html')
  .expect(`layout <div id='root'><a data-reactroot="" data-reactid="1" data-react-checksum="1290998820">custom component</a></div>\n`)
  .end(t.end)
})
