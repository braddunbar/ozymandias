'use strict'

const User = require('./user')
const Token = require('./token')
const forgotMail = require('./mail/forgot')
const {del, get, post} = require('koa-route')

// Find User
const findUser = (email) => (
  User.where('trim(lower(email)) = trim(lower(?))', email).find()
)

// Find Token
const findToken = (id) => (
  Token.include('user').where('expires_at >= now()').find(id)
)

module.exports = [

  // Sign In
  post('/session', function *() {
    const {email, password} = this.request.body
    const user = yield findUser(email)

    if (!user) {
      this.status = 422
      this.body = {email: ['Sorry! We don’t recognize that email.']}
      return
    }

    if (yield user.authenticate(password)) {
      this.signIn(user)
      this.body = {}
    } else {
      this.status = 422
      this.body = {password: ['Sorry! That password is incorrect.']}
    }
  }),

  del('/session', function *() {
    this.signOut()
    this.body = {}
  }),

  get('/session/reset/:id', function *(id) {
    const token = yield findToken(id)
    this.react({
      token: token && token.id,
      email: token && token.user.email
    })
  }),

  post('/session/reset/:id', function *(id) {
    const token = yield findToken(id)
    const {password} = this.request.body

    if (!token) {
      this.status = 422
      this.body = {password: ['Sorry! That token is expired.']}
      return
    }

    if (!password) {
      this.status = 422
      this.body = {password: ['You must provide a password.']}
      return
    }

    yield token.user.update(this.permit('password'))
    this.signIn(token.user)
    this.body = {}
  }),

  post('/session/forgot', function *() {
    const {email} = this.request.body
    const user = yield findUser(email)

    if (!user) {
      this.status = 422
      this.body = {email: ['Sorry! We don’t recognize that email.']}
      return
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const token = yield Token.create({expiresAt, userId: user.id})

    yield this.mail(forgotMail, {
      to: [user.email],
      subject: `${process.env.NAME}: Password Reset`,
      url: `http://${this.host}/session/reset/${token.id}`
    })

    this.body = {}
  })

]
