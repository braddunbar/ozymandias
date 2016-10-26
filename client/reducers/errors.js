import {SET_ERRORS} from '../actions'

export const errors = (state = null, action) => {
  switch (action.type) {
    case SET_ERRORS:
      return action.errors

    default:
      return state
  }
}
