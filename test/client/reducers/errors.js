import test from 'tape'
import freeze from 'deep-freeze'
import {SET_ERRORS} from '../../../client/actions'
import {errors} from '../../../client/reducers'

test('set errors', (assert) => {
  const state = null
  const next = errors(state, {
    type: SET_ERRORS,
    errors: {name: ['Name Error']}
  })
  assert.deepEqual(next, {name: ['Name Error']})
  assert.end()
})

test('clear errors', (assert) => {
  const state = freeze({name: ['Name Error']})
  const next = errors(state, {
    type: SET_ERRORS,
    errors: null
  })
  assert.deepEqual(next, null)
  assert.end()
})
