'use strict'

const User = require('./user')
const Token = require('./token')
const json = require('./json/session')
const forgotMail = require('./mail/forgot')
const router = module.exports = require('./').Router()

// Find User
const findUser = (request, response, next) => {
  User.where('trim(lower(email)) = trim(lower(?))', request.body.email).find()
  .then((user) => {
    request.user = user
    next()
  }).catch(response.error)
}

// Find Token
const findToken = (request, response, next) => {
  Token.include('user')
  .where('expires_at >= now()')
  .find(request.params.tokenId)
  .then((token) => {
    request.token = token
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
router.get('/reset/:tokenId', findToken, (request, response) => {
  response.react(json.reset, {token: request.token})
})

router.post('/reset/:tokenId', findToken, (request, response) => {
  if (!request.token) {
    return response.status(422).json({
      password: ['Sorry! That token is expired.']
    })
  }

  if (!request.body.password) {
    return response.status(422).json({
      password: ['You must provide a password.']
    })
  }

  const {user} = request.token

  user.update(request.permit('password')).then(() => {
    request.signIn(user)
    response.json({})
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
      url: `http://${request.get('host')}/session/reset/${token.id}`
    })
  )).then(() => {
    response.json({})
  }).catch(response.error)
})
