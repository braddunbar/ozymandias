import test from 'tape'
import {BUSY, DONE} from '../../../client/actions'
import {busy} from '../../../client/reducers'

test('busy', (t) => {
  const state = false
  const next = busy(state, {type: BUSY})
  t.is(next, true)
  t.end()
})

test('done', (t) => {
  const state = true
  const next = busy(state, {type: DONE})
  t.is(next, false)
  t.end()
})

test('empty', (t) => {
  const state = null
  const next = busy(state, {})
  t.is(next, false)
  t.end()
})
