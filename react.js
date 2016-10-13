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
      statusCode: this.status,
      url: this.originalUrl,
      version: version
    })

    switch (this.accepts('html', 'json')) {
      case 'html':
        const element = React.createElement(this.client, toJSON(state))
        this.state.state = state
        this.body = `<div id='root'>${ReactDOM.renderToString(element)}</div>`
        break

      case 'json':
        this.body = state
        break
    }
  }

}
