import React from 'react'
import Errors from './errors'
import {forgot, setMessage} from '../actions'

export default ({busy, errors}) => {
  let email = null

  const submit = (event) => {
    event.preventDefault()
    forgot({email: email.value}).then(() => {
      setMessage('success', 'Thanks! We sent you an email to reset your password.')
    }).catch(() => {})
  }

  return <form onSubmit={submit}>
    <h3>Forgot Password</h3>
    <div className='form-group'>
      <label htmlFor='email'>Email</label>
      <input type='text' id='email' className='form-control'
        placeholder='you@example.com' required autoFocus
        ref={(input) => { email = input }} />
    </div>
    <Errors errors={errors} />
    <div className='text-xs-right'>
      <button className='btn btn-success' disabled={busy}>
        Email My Password
      </button>
    </div>
  </form>
}
