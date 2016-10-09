export default (url, options = {}) => new Promise((resolve, reject) => {
  let {body} = options
  const request = new window.XMLHttpRequest()
  const headers = options.headers || {}

  // Stringify the body if necessary.
  if (typeof body === 'object' && !(body instanceof window.FormData)) {
    body = JSON.stringify(body)
    headers['content-type'] = 'application/json'
  }

  // Set accept header.
  headers.accept = 'application/json'

  // Open the request.
  request.open(options.method || 'get', url)

  // Include credentials (must be after open for IE11 and below).
  request.withCredentials = true

  // Set headers.
  for (const key in headers) request.setRequestHeader(key, headers[key])

  // Send it!
  request.send(body)

  // Complete
  request.addEventListener('load', () => {
    const {status, responseText} = request
    let response = responseText

    // Parse the response.
    if (/json/.test(request.getResponseHeader('content-type'))) {
      response = JSON.parse(responseText)
    }

    if (status >= 200 && status < 400) {
      resolve(response)
    } else {
      const error = new Error('XHR Error')
      error.url = url
      error.status = status
      error.response = response
      reject(error)
    }
  })

  // Error
  request.addEventListener('error', (event) => {
    // Aborted requests are neither resolved nor rejected.
    if (request.status === 0) return
    const error = new Error('XHR Error')
    error.url = url
    error.status = status
    reject(error)
  })

  // Timeout
  request.addEventListener('timeout', (event) => {
    const error = new Error('XHR Timeout')
    error.url = url
    reject(error)
  })
})
.catch((error) => {
  if (error.status !== 422) window.Bugsnag.notifyException(error)
  throw error
})
