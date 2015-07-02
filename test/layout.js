var test = require('tape')
var request = require('supertest')

var app = require('../')()
app.set('views', 'test/views')

app.get('/', function (req, res) {
  res.render('index')
})

test('render the layout', function (t) {
  request(app)
  .get('/')
  .expect('layout index\n\n')
  .end(t.end)
})
