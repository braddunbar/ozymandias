'use strict'

const db = require('../../db/instance')

class Post extends db.Model {

  static get tableName () {
    return 'posts'
  }

  static get columns () {
    return [
      {name: 'id'},
      {name: 'body'},
      {name: 'published'},
      {name: 'user_id', property: 'userId'},
      {name: 'search'}
    ]
  }

}

module.exports = Post
