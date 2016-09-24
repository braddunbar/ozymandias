'use strict'

const User = require('./user')
const Token = require('./token')
const forgotMail = require('./mail/forgot')
const router = module.exports = require('./').Router()

// Find User
const findUser = (request, response, next) => {
  User.where('trim(lower(email)) = trim(lower(?))', request.body.email).find()
  .then((user) => {
    request.user = response.locals.user = user
    next()
  }).catch(response.error)
}

// Sign In
router.post('/', findUser, (request, response) => {
  if (!request.user) {
    response.status(422).json({
      email: ['Sorry! We don’t recognize that email.']
    })
    return
  }

  // Is the password correct?
  request.user.authenticate(request.body.password).then((match) => {
    if (match) {
      request.signIn(request.user)
      response.json({})
      return
    }

    response.status(422).json({
      password: ['Sorry! That password is incorrect.']
    })
  }).catch(response.error)
})

// Sign Out
router.delete('/', (request, response) => {
  request.signOut()
  response.json({})
})

// Reset
router.post('/reset/:tokenId', (request, response) => {
  Token.include('user')
  .where('expires_at >= now()')
  .find(request.params.tokenId)
  .then((token) => {
    if (!token) {
      return response.status(422).json({
        password: ['Sorry! That token is expired.']
      })
    }

    if (!request.body.password) {
      return response.status(422).json({
        password: ['You must provide a password.']
      })
    }

    return token.user.update(request.permit('password')).then(() => {
      request.signIn(token.user)
      response.json({})
    })
  }).catch(response.error)
})

// Forgot
router.post('/forgot', findUser, (request, response) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  if (!request.user) {
    return response.status(422).json({
      email: ['Sorry! We don’t recognize that email.']
    })
  }

  Token.create({expiresAt, userId: request.user.id}).then((token) => (
    request.mail(forgotMail, {
      to: [request.user.email],
      subject: `${process.env.NAME}: Password Reset`,
      url: `http://${request.get('host')}/signin/reset/${token.id}`
    })
  )).then(() => {
    response.json({})
  }).catch(response.error)
})
