'use strict'

const {version} = require('./assets')
const React = require('react')
const ReactDOM = require('react-dom/server')
const toJSON = require('object-tojson')
const url = require('url')

module.exports = {

  react (state = {}) {
    Object.assign(state, {
      path: url.parse(this.originalUrl).pathname,
      statusCode: this.response._explicitStatus ? this.status : 200,
      url: this.originalUrl,
      version: version
    })

    switch (this.accepts('html', 'json')) {
      case 'html':
        // Make sure the client/server state match.
        this.state.state = toJSON(state)

        const element = React.createElement(this.client, this.state.state)
        const html = ReactDOM.renderToString(element)

        this.body = `<div id='root'>${html}</div>`
        break

      case 'json':
        this.body = state
        break
    }
  }

}
