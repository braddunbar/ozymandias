'use strict'

const test = require('tape')
const User = require('../user')
const db = require('../db/instance')

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
  db.transaction(() => {
    User.create({
      email: 'user@example.com',
      password: 'password'
    }).then((user) => {
      return user.authenticate('password').then((match) => {
        t.ok(match)
        t.end()
      })
    }).catch(t.end)
    throw new Error('rollback')
  }).catch(t.end)
})

test('updating a user hashes the password', (t) => {
  const user = new User({id: 1})
  db.transaction(() => {
    user.update({
      email: 'user@example.com',
      password: 'new password'
    }).then(() => {
      return user.authenticate('new password').then((match) => {
        t.ok(match)
        t.end()
      })
    }).catch(t.end)
    throw new Error('rollback')
  }).catch(t.end)
})
