'use strict'

const test = require('./test')
const User = require('../user')

test('authenticate a user', async ({assert}) => {
  const hash = '$2a$04$GSyRKrbgj9PWCc.cHQsFJO3nSc0dz.JO..SZBIFBuyPTnquf3OswG'
  const user = new User({password: hash})
  const [right, wrong] = await Promise.all([
    user.authenticate('secret'),
    user.authenticate('wrong')
  ])

  assert.ok(right)
  assert.ok(!wrong)
})

test('email is trimmed', async ({assert}) => {
  const user = new User({email: ' user@example.com '})
  assert.is(user.email, 'user@example.com')
  user.email = ' user@example.com '
  assert.is(user.email, 'user@example.com')
})

test('creating a user hashes the password', async ({assert}) => {
  const user = await User.create({
    email: 'user@example.com',
    password: 'password'
  })
  assert.ok(await user.authenticate('password'))
})

test('updating a user hashes the password', async ({assert}) => {
  const user = new User({id: 1})
  await user.update({
    email: 'user@example.com',
    password: 'new password'
  })
  assert.ok(await user.authenticate('new password'))
})

test('authenticate a user without a password', async ({assert}) => {
  const user = new User({id: 1, password: null})
  assert.ok(!(await user.authenticate('password')))
})

test('validate email', async ({assert}) => {
  const user = new User({email: 'invalid'})

  user.validate()
  assert.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'still.invalid'
  user.validate()
  assert.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'still@invalid'
  user.validate()
  assert.deepEqual(user.errors.email, ['Invalid Email'])

  user.email = 'valid@example.com'
  user.validate()
  assert.is(user.errors.email, undefined)

  user.email = 'valid@subdomain.example.com'
  user.validate()
  assert.is(user.errors.email, undefined)
})

test('validate password on create', async ({assert}) => {
  try {
    await User.create({password: 'asdf'})
    assert.fail('password was not validated')
  } catch ({message, model}) {
    assert.is(message, 'invalid')
    assert.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
  }
})

test('validate password on update', async ({assert}) => {
  const user = await User.find(1)
  try {
    await user.update({password: 'asdf'})
    assert.fail('password was not validated')
  } catch ({message, model}) {
    assert.is(message, 'invalid')
    assert.deepEqual(model.errors.password, ['Password must be at least eight characters long'])
  }
})

test('User#isAdmin accepts falsy/truthy strings', async ({assert}) => {
  const user = new User({isAdmin: 0})
  assert.is(user.isAdmin, false)
  user.isAdmin = 1
  assert.is(user.isAdmin, true)
  user.isAdmin = '0'
  assert.is(user.isAdmin, false)
  user.isAdmin = '1'
  assert.is(user.isAdmin, true)
  user.isAdmin = true
  assert.is(user.isAdmin, true)
  user.isAdmin = false
  assert.is(user.isAdmin, false)
})
