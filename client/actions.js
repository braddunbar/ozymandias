import store from './store'

export const BUSY = 'BUSY'
export const DONE = 'DONE'

export const busy = (value) => {
  store.dispatch({type: BUSY})
  return value
}

export const done = (value) => {
  store.dispatch({type: DONE})
  if (value instanceof Error) throw value
  return value
}
