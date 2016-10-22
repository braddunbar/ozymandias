import tape from 'tape'
import React from 'react'
import Router, {Route} from '../../client/router'

tape('one router component', (assert) => {
  const state = {path: '/'}
  const Index = () => {}
  const element = Router({
    state,
    children: <Route path='/' Component={Index} />
  })
  assert.deepEqual(element, <Index {...state} />)
  assert.end()
})

tape('two children', (assert) => {
  const state = {path: '/one'}
  const One = () => {}
  const Two = () => {}
  const element = Router({
    state,
    children: [
      <Route path='/one' Component={One} />,
      <Route path='/two' Component={Two} />
    ]
  })
  assert.deepEqual(element, <One {...state} />)
  assert.end()
})

tape('two children with wrapper', (assert) => {
  const state = {path: '/one'}
  const App = () => {}
  const One = () => {}
  const Two = () => {}
  const element = Router({
    state,
    children: <Route path='/' Component={App}>
      <Route path='one' Component={One} />
      <Route path='two' Component={Two} />
    </Route>
  })
  assert.deepEqual(element, <App {...state}><One {...state} /></App>)
  assert.end()
})

tape('params', (assert) => {
  const state = {path: '/users/1'}
  const Index = () => {}
  const element = Router({
    state,
    children: <Route path='/users/:id' Component={Index} />
  })
  assert.deepEqual(element, <Index {...state} />)
  assert.end()
})

tape('return null on no match', (assert) => {
  const state = {path: '/x'}
  const Index = () => {}
  const element = Router({
    state,
    children: <Route path='/y' Component={Index} />
  })
  assert.deepEqual(element, null)
  assert.end()
})

tape('return null on no child match', (assert) => {
  const state = {path: '/x'}
  const App = () => {}
  const Index = () => {}
  const element = Router({
    state,
    children: <Route path='/' Component={App}>
      <Route path='y' Component={Index} />
    </Route>
  })
  assert.deepEqual(element, null)
  assert.end()
})
