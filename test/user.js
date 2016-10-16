'use strict'

const test = require('./test')
const User = require('../user')

test('authenticate a user', function *(t) {
  const hash = '$2a$04$GSyRKrbgj9PWCc.cHQsFJO3nSc0dz.JO..SZBIFBuyPTnquf3OswG'
  const user = new User({password: hash})
  const [right, wrong] = yield Promise.all([
    user.authenticate('secret'),
    user.authenticate('wrong')
  ])

  t.ok(right)
  t.ok(!wrong)
})

test('email is trimmed', function *(t) {
  const user = new User({email: ' user@example.com '})
  t.is(user.email, 'user@example.com')
  user.email = ' user@example.com '
  t.is(user.email, 'user@example.com')
})

test('creating a user hashes the password', function *(t) {
  const user = yield User.create({
    email: 'user@example.com',
    password: 'password'
  })
  t.ok(yield user.authenticate('password'))
})

test('updating a user hashes the password', function *(t) {
  const user = new User({id: 1})
  yield user.update({
    email: 'user@example.com',
    password: 'new password'
  })
  t.ok(yield user.authenticate('new password'))
})

test('authenticate a user without a password', function *(t) {
  const user = new User({id: 1, password: null})
  t.ok(!(yield user.authenticate('password')))
})

test('validate email', function *(t) {
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
})

test('validate password on create', function *(t) {
  try {
    yield User.create({password: 'asdf'})
    t.fail('password was not validated')
  } catch ({message, model}) {
    t.is(message, 'invalid')
    t.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
  }
})

test('validate password on update', function *(t) {
  const user = yield User.find(1)
  try {
    yield user.update({password: 'asdf'})
    t.fail('password was not validated')
  } catch ({message, model}) {
    t.is(message, 'invalid')
    t.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
  }
})

test('User#isAdmin accepts falsy/truthy strings', function *(t) {
  const user = new User({isAdmin: 0})
  t.is(user.isAdmin, false)
  user.isAdmin = 1
  t.is(user.isAdmin, true)
  user.isAdmin = '0'
  t.is(user.isAdmin, false)
  user.isAdmin = '1'
  t.is(user.isAdmin, true)
  user.isAdmin = true
  t.is(user.isAdmin, true)
  user.isAdmin = false
  t.is(user.isAdmin, false)
})
