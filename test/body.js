'use strict'

let ozy = require('../')
let test = require('./test')
let request = require('supertest')

test('parse json bodies', function (t) {
  let app = ozy()

  app.post('/json', function (request, response) {
    response.json(request.body)
  })

  let values = {x: 1, y: 2, z: 3}

  request(app)
  .post('/json')
  .set('Content-Type', 'application/json')
  .send(JSON.stringify(values))
  .expect(values)
  .end(t.end)
})

test('parse urlencoded bodies', function (t) {
  let app = ozy()

  app.post('/urlencoded', function (request, response) {
    response.json(request.body)
  })

  request(app)
  .post('/urlencoded')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send('x=1&y=2&z=3')
  .expect({x: 1, y: 2, z: 3})
  .end(t.end)
})
