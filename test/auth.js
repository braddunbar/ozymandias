'use strict'

const app = require('../')()
const test = require('./test')
const User = require('../user')
const request = require('supertest')

app.post('/signin', (req, res) => {
  User.where('trim(lower(email)) = trim(lower(?))', req.body.email).find()
  .then((user) => {
    req.signIn(user)
    res.end()
  }).catch(res.error)
})

app.get('/user/id', (req, res) => {
  res.json({id: req.currentUser.id})
})

test('fetch a user', (t) => {
  const agent = request.agent(app)
  agent.post('/signin')
  .send('email=brad@example.com')
  .expect(200)
  .end((error) => {
    if (error) return t.end(error)
    agent.get('/user/id')
    .set('Accept', 'application/json')
    .expect(200, {id: 1})
    .end(t.end)
  })
})
