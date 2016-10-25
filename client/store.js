import {createStore} from 'redux'

const el = typeof document !== 'undefined' && document.getElementById('state')
const state = el ? JSON.parse(el.innerHTML) : undefined
export default createStore((state, action) => state, state)
