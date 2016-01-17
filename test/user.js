'use strict'

const test = require('./test')
const User = require('../user')

test('authenticate a user', (t) => {
  const hash = '$2a$04$GSyRKrbgj9PWCc.cHQsFJO3nSc0dz.JO..SZBIFBuyPTnquf3OswG'
  const user = new User({password: hash})
  Promise.all([
    user.authenticate('secret').then((match) => t.ok(match)),
    user.authenticate('wrong').then((match) => t.ok(!match))
  ]).then(() => t.end()).catch(t.end)
})

test('email is trimmed', (t) => {
  const user = new User({email: ' user@example.com '})
  t.is(user.email, 'user@example.com')
  user.email = ' user@example.com '
  t.is(user.email, 'user@example.com')
  t.end()
})

test('creating a user hashes the password', (t) => {
  User.create({
    email: 'user@example.com',
    password: 'password'
  }).then((user) => {
    return user.authenticate('password').then((match) => {
      t.ok(match)
      t.end()
    })
  }).catch(t.end)
})

test('updating a user hashes the password', (t) => {
  const user = new User({id: 1})
  user.update({
    email: 'user@example.com',
    password: 'new password'
  }).then(() => {
    return user.authenticate('new password').then((match) => {
      t.ok(match)
      t.end()
    })
  }).catch(t.end)
})

test('toJSON does not include password', (t) => {
  const user = new User({id: 1, password: 'password'})
  t.ok(!user.toJSON().password)
  t.end()
})
