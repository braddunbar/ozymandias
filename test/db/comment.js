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
