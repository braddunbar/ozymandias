import test from 'tape'
import {setParams} from '../../client/querystring'

test('add to plain path', (assert) => {
  assert.is(setParams('/path', {x: 1, y: 2}), '/path?x=1&y=2')
  assert.end()
})

test('replace existing values', (assert) => {
  assert.is(setParams('/path?x=3', {x: 1, y: 2}), '/path?x=1&y=2')
  assert.end()
})

test('replace multiple existing values', (assert) => {
  assert.is(setParams('/path?x=3&x=4', {x: 1}), '/path?x=1')
  assert.end()
})

test('include arrays', (assert) => {
  assert.is(setParams('/path', {x: [1, 2]}), '/path?x=1&x=2')
  assert.end()
})

test('encodes values', (assert) => {
  assert.is(setParams('/path', {'/': '/'}), '/path?%2F=%2F')
  assert.end()
})

test('exclude null values', (assert) => {
  assert.is(setParams('/path?x=1', {x: null}), '/path')
  assert.is(setParams('/path?x=1', {x: undefined}), '/path')
  assert.is(setParams('/path?x=1', {x: undefined, y: 2}), '/path?y=2')
  assert.end()
})

test('exlude empty arrays', (assert) => {
  assert.is(setParams('/path', {x: []}), '/path')
  assert.is(setParams('/path?y=1', {x: []}), '/path?y=1')
  assert.end()
})
