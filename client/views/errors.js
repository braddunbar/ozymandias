import React from 'react'

export default ({errors}) => {
  if (!errors) return null

  return <div className='alert alert-danger' id='errors'>
    <p>
      <strong>Whoops!</strong> Can you try that again?
    </p>
    <ul>
      {Object.keys(errors).map((name) => (
        errors[name].map((error) => <li>{error}</li>)
      ))}
    </ul>
  </div>
}
