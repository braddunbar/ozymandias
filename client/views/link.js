import React from 'react'
import {navigate} from '../actions'

export default (props) => {
  const click = (event) => {
    if (event.metaKey) return
    event.preventDefault()
    navigate(props.href)
  }

  return <a {...props} onClick={click}>{props.children}</a>
}
