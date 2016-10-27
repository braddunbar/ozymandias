import xhr from './xhr'
import {setErrors, setMessage, clearMessage} from './actions'

const json = (method, url, body, headers = {}) => {
  // Let the user know we're doing something.
  setMessage('info', 'Working…')

  // Only accept JSON.
  headers.accept = 'application/json'

  // JSON encode the body if necessary.
  if (body && typeof body !== 'string' && !(body instanceof window.FormData)) {
    body = JSON.stringify(body)
    headers['content-type'] = 'application/json'
  }

  return xhr(method, url, body, headers).then((response) => {
    clearMessage()
    setErrors(null)
    return response
  }).catch((error) => {
    if (error.status === 422) {
      setErrors(error.response)
      setMessage('error', 'Whoops! Can you try that again?')
    } else {
      setMessage('error', 'Whoops! Something went wrong…')
    }
    throw error
  })
}

export const del = (...args) => json('delete', ...args)
export const get = (...args) => json('get', ...args)
export const post = (...args) => json('post', ...args)
