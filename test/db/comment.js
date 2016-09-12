'use strict'

const db = require('../../db/instance')

class Comment extends db.Model {

  static get tableName () {
    return 'comments'
  }

  static get columns () {
    return [
      'id',
      'body',
      'postId',
      'userId'
    ]
  }

}

module.exports = Comment

const Post = require('./post')
const User = require('./user')

Comment.belongsTo('user', {model: User, key: 'userId'})
Comment.belongsTo('post', {model: Post, key: 'postId'})
