'use strict'

const app = require('../')()
const test = require('./test')
const User = require('../user')
const request = require('supertest')

app.set('user', User)

app.post('/signin', (request, response) => {
  User.find(1).then((user) => {
    request.signIn(user)
    response.end()
  }).catch(response.error)
})

app.get('/user/id', (request, response) => {
  response.json({id: request.currentUser && request.currentUser.id})
})

test('no user', (t) => {
  request(app)
  .get('/user/id')
  .expect(200, {})
  .end(t.end)
})

test('fetch a user', (t) => {
  const agent = request.agent(app)
  agent.post('/signin')
  .expect(200)
  .end((error) => {
    if (error) return t.end(error)
    agent.get('/user/id')
    .set('Accept', 'application/json')
    .expect(200, {id: 1})
    .end(t.end)
  })
})
