import {get} from './json'
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

// Errors

export const SET_ERRORS = 'SET_ERRORS'

export const setErrors = (errors) => store.dispatch({type: SET_ERRORS, errors})

// Navigate

export const REPLACE = 'REPLACE'

export const navigate = (url, {push} = {}) => {
  busy()

  // No pushState? No problem.
  if (!window.history || !window.history.pushState) {
    window.location = url
    return
  }

  // Change the url.
  if (push !== false) {
    window.history.pushState(null, document.title, url)
  }

  // Fetch the page state and render the page.
  return get(url).then((state) => {
    // If the version has changed, reload the whole page.
    if (store.getState().version !== state.version) {
      window.location = url
      return
    }

    store.dispatch({type: REPLACE, state})
    window.scrollTo(0, 0)
    done()
  }).catch(({state}) => {
    if (state) store.dispatch({type: REPLACE, state})
    done()
  })
}