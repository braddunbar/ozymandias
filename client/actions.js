import store from './store'

// Busy?

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

// Message

export const SET_MESSAGE = 'SET_MESSAGE'
export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'

let messageTimer
export const setMessage = (type, text) => {
  clearTimeout(messageTimer)
  store.dispatch({type: SET_MESSAGE, message: {active: true, type, text}})
  messageTimer = setTimeout(clearMessage, 10000)
}

export const clearMessage = () => {
  clearTimeout(messageTimer)
  store.dispatch({type: CLEAR_MESSAGE})
}
