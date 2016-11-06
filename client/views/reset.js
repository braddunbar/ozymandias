import React from 'react'
import Link from './link'
import Errors from './errors'
import {navigate, reset} from '../actions'

export default ({busy, email, errors, expired, token, returnTo}) => {
  let passwordInput

  const submit = (event) => {
    event.preventDefault()
    reset(token, {password: passwordInput.value}).then(() => {
      navigate(returnTo)
    }).catch(() => {})
  }

  return <form onSubmit={submit}>
    <h3>Reset Password</h3>
    {expired
      ? <div>
        <h3>Sorry! That token is expired.</h3>
        <p>
          Would you like us to <Link href='/signin/forgot'>send you another one</Link>?
        </p>
      </div>
      : <div className='form-group'>
        <label htmlFor='password'>New Password for {email || ''}</label>
        <input type='password' id='password' className='form-control'
          required autoFocus ref={(input) => { passwordInput = input }} />
      </div>
    }
    <Errors errors={errors} />
    {token
      ? <div className='text-xs-right'>
        <button className='btn btn-success' disabled={busy}>
          Reset Password
        </button>
      </div>
      : ''
    }
  </form>
}
