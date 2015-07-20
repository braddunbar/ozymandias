var test = require('tape')
var request = require('supertest')

var app = require('../')()
app.set('views', 'test/views')

app.get('/layout', function (req, res) {
  res.render('index')
})

test('render the layout', function (t) {
  request(app)
  .get('/layout')
  .expect('layout index\n\n')
  .end(t.end)
})

app.get('/alternate', function (req, res) {
  res.render('index', {layout: 'alternate'})
})

test('render an alternate layout', function (t) {
  request(app)
  .get('/alternate')
  .expect('alternate layout index\n\n')
  .end(t.end)
})

app.get('/nolayout', function (req, res) {
  res.render('index', {layout: false})
})

test('render no layout', function (t) {
  request(app)
  .get('/nolayout')
  .expect('index\n')
  .end(t.end)
})
