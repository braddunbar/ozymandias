'use strict'

const db = require('../../db/instance')

class Post extends db.Model {

  static get tableName () {
    return 'posts'
  }

  static get columns () {
    return [
      'id',
      'body',
      'published',
      'userId',
      'search'
    ]
  }

}

module.exports = Post

const User = require('./user')
const Comment = require('./comment')

Post.belongsTo('user', {model: User, key: 'userId'})
Post.hasMany('comments', {model: Comment, key: 'postId'})
