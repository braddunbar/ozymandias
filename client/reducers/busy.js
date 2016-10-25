import {BUSY, DONE} from '../actions'

export const busy = (state = null, action) => {
  switch (action.type) {
    case BUSY:
      return true

    case DONE:
      return false

    default:
      return state || false
  }
}
