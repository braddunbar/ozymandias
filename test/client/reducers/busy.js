import test from 'tape'
import {BUSY, DONE} from '../../../client/actions'
import {busy} from '../../../client/reducers'

test('busy', (assert) => {
  const state = false
  const next = busy(state, {type: BUSY})
  assert.is(next, true)
  assert.end()
})

test('done', (assert) => {
  const state = true
  const next = busy(state, {type: DONE})
  assert.is(next, false)
  assert.end()
})

test('empty', (assert) => {
  const state = null
  const next = busy(state, {})
  assert.is(next, false)
  assert.end()
})
