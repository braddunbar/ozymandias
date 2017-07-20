import './errors'
import './analytics'
import 'es6-promise/auto'
import './to-locale-string'
import React, {PureComponent} from 'react'
import store from './store'

export default class App extends PureComponent {
  constructor (props) {
    super(props)
    this.state = store.getState()
    store.subscribe(() => this.setState(store.getState()))
  }

  render () {
    return <this.props.View {...this.state} />
  }
}
