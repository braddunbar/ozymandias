'use strict'

let db = require('../../db/instance')

class Comment extends db.Model {

  static get tableName () {
    return 'comments'
  }

  static get columns () {
    return [
      {name: 'id'},
      {name: 'body'},
      {name: 'post_id', property: 'postId'},
      {name: 'user_id', property: 'userId'}
    ]
  }

}

module.exports = Comment
