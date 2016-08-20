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
  }).then((user) => (
    user.authenticate('password').then((match) => {
      t.ok(match)
      t.end()
    })
  )).catch(t.end)
})

test('updating a user hashes the password', (t) => {
  const user = new User({id: 1})
  user.update({
    email: 'user@example.com',
    password: 'new password'
  }).then(() => (
    user.authenticate('new password').then((match) => {
      t.ok(match)
      t.end()
    })
  )).catch(t.end)
})

test('authenticate a user without a password', (t) => {
  const user = new User({id: 1, password: null})
  user.authenticate('password').then((match) => {
    t.ok(!match)
    t.end()
  }).catch(t.end)
})

test('validate email', (t) => {
  const user = new User({email: 'invalid'})

  user.validate()
  t.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'still.invalid'
  user.validate()
  t.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'still@invalid'
  user.validate()
  t.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'valid@example.com'
  user.validate()
  t.is(user.errors.email, undefined)

  user.email = 'valid@subdomain.example.com'
  user.validate()
  t.is(user.errors.email, undefined)

  t.end()
})

test('validate password on create', (t) => {
  User.create({password: 'asdf'}).then(() => {
    t.end('password was not validated')
  })
  .catch(({message, model}) => {
    t.is(message, 'invalid')
    t.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
    t.end()
  })
})

test('validate password on update', (t) => {
  User.find(1).then((user) => {
    user.update({password: 'asdf'}).then(() => {
      t.end('password was not validated')
    }).catch(({message, model}) => {
      t.is(message, 'invalid')
      t.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
      t.end()
    })
  }).catch(t.end)
})
