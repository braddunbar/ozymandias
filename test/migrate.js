'use strict'

const test = require('./test')
const migrate = require('../migrate')
const Migration = require('../migration')
const User = require('../user')

test('inserts into migration table', async ({assert}) => {
  await migrate('./test/migrate/success')
  const migrations = await Migration.all()
  assert.deepEqual(migrations.map(({id}) => id), [
    '2017-01-01-1200-one',
    '2017-01-02-1200-two'
  ])
})

test('runs the migrations', async ({assert}) => {
  await migrate('./test/migrate/success')
  assert.is((await User.find(1)).email, 'bradley@example.com')
  assert.is((await User.find(2)).email, 'kimberly@example.com')
})

test('runs failing migrations', async ({assert}) => {
  try {
    await migrate('./test/migrate/fail')
    assert.fail()
  } catch (error) {
  }
})
