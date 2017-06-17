'use strict'

const ms = require('ms')
const User = require('./user')
const Token = require('./token')
const forgotMail = require('./mail/forgot')
const {del, get, post} = require('koa-route')

// Find User
const findUser = (email) => (
  User.where('trim(lower(email)) = trim(lower(?))', email).find()
)

// Find Token
const findToken = async (id) => {
  try {
    return await Token.include('user').where('expires_at >= now()').find(id)
  } catch (error) {
    return null
  }
}

module.exports = [

  // Sign In
  post('/session', async (_) => {
    const {email, password} = _.request.body
    const user = await findUser(email)

    if (!user) {
      _.status = 422
      _.body = {email: ['Sorry! We don’t recognize that email.']}
      return
    }

    if (await user.authenticate(password)) {
      await _.signIn(user)
      _.body = {}
    } else {
      _.status = 422
      _.body = {password: ['Sorry! That password is incorrect.']}
    }
  }),

  del('/session', async (_) => {
    await _.signOut()
    _.body = {}
  }),

  get('/session/signin', async (_) => {
    _.react()
  }),

  get('/session/forgot', async (_) => {
    _.react()
  }),

  get('/session/reset/:id', async (_, id) => {
    const token = await findToken(id)
    _.react({
      token: token && token.id,
      email: token && token.user.email
    })
  }),

  post('/session/reset/:id', async (_, id) => {
    const token = await findToken(id)
    const {password} = _.request.body

    if (!token) {
      _.status = 422
      _.body = {password: ['Sorry! That token is expired.']}
      return
    }

    if (!password) {
      _.status = 422
      _.body = {password: ['You must provide a password.']}
      return
    }

    await token.user.update(_.permit('password'))
    await _.signIn(token.user)
    _.body = {}
  }),

  post('/session/forgot', async (_) => {
    const {email} = _.request.body
    const user = await findUser(email)

    if (!user) {
      _.status = 422
      _.body = {email: ['Sorry! We don’t recognize that email.']}
      return
    }

    const expiresAt = new Date(+new Date() + ms('1d'))
    const token = await Token.create({expiresAt, userId: user.id})

    await _.mail(forgotMail, {
      to: [user.email],
      subject: `${process.env.NAME}: Password Reset`,
      url: `http://${_.host}/session/reset/${token.id}`
    })

    _.body = {}
  })

]
