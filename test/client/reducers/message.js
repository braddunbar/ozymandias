import test from 'tape'
import freeze from 'deep-freeze'
import {CLEAR_MESSAGE, SET_MESSAGE} from '../../../client/actions'
import {message} from '../../../client/reducers'

test('set message', (assert) => {
  const state = freeze({active: true, type: 'success', text: 'Done!'})
  const next = message(state, {
    type: SET_MESSAGE,
    message: {active: false, type: 'danger', text: 'Whoops!'}
  })
  assert.deepEqual(next, {active: false, type: 'danger', text: 'Whoops!'})
  assert.end()
})

test('clear message', (assert) => {
  const state = freeze({active: true, type: 'success', text: 'Done!'})
  const next = message(state, {type: CLEAR_MESSAGE})
  assert.deepEqual(next, {active: false, type: 'success', text: 'Done!'})
  assert.end()
})
