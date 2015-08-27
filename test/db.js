'use strict'

let test = require('tape')
let DB = require('../db')

let db = new DB(process.env.DATABASE_URL)

let User = db.define({
  tableName: 'users',
  columns: ['id', 'email', 'first', 'last', 'birthday'],
  get email () { return this.data.get('email') },
  set email (value) { this.data.set('email', value.trim()) }
})

let Post = db.define({
  tableName: 'posts',
  columns: [
    {name: 'id'},
    {name: 'body'},
    {name: 'published'},
    {name: 'user_id', property: 'userId'}
  ]
})

let Comment = db.define({
  tableName: 'comments',
  columns: [
    {name: 'id'},
    {name: 'body'},
    {name: 'post_id', property: 'postId'},
    {name: 'user_id', property: 'userId'}
  ]
})

User.hasMany('posts', {
  model: Post,
  key: 'userId'
})

User.hasMany('comments', {
  model: Comment,
  key: 'userId'
})

Post.belongsTo('user', {
  model: User,
  key: 'userId'
})

Post.hasMany('comments', {
  model: Comment,
  key: 'postId'
})

Comment.belongsTo('user', {
  model: User,
  key: 'userId'
})

Comment.belongsTo('post', {
  model: Post,
  key: 'postId'
})

test('query database', function (t) {
  db.query('select email from users where id = 1').then(function (result) {
    t.deepEqual(result.rows, [{email: 'brad@example.com'}])
    t.end()
  }).catch(t.end)
})

test('create a new model with data', function (t) {
  let user = new User({
    id: 1,
    email: ' brad@example.com ',
    first: 'Brad',
    last: 'Dunbar'
  })
  t.is(user.id, 1)
  t.is(user.email, 'brad@example.com')
  t.is(user.first, 'Brad')
  t.is(user.last, 'Dunbar')
  t.end()
})

test('create model without data', function (t) {
  let user = new User()
  t.is(user.id, undefined)
  t.is(user.email, undefined)
  t.is(user.first, undefined)
  t.is(user.last, undefined)
  t.end()
})

test('use a setter', function (t) {
  let user = new User()
  user.email = ' brad@example.com '
  t.is(user.email, 'brad@example.com')
  t.end()
})

test('find a user', function (t) {
  User.find(1).then(function (user) {
    t.is(user.id, 1)
    t.is(user.email, 'brad@example.com')
    t.is(user.first, 'Brad')
    t.is(user.last, 'Dunbar')
    t.end()
  }).catch(t.end)
})

test('find a non-existent user', function (t) {
  User.find(123456789).then(function (user) {
    t.is(user, null)
    t.end()
  }).catch(t.end)
})

test('find all users with where clause', function (t) {
  User.where({id: 1}).all().then(function (users) {
    t.is(users.length, 1)
    t.is(users[0].id, 1)
    t.is(users[0].email, 'brad@example.com')
    t.is(users[0].first, 'Brad')
    t.is(users[0].last, 'Dunbar')
    t.end()
  }).catch(t.end)
})

test('where clause with array', function (t) {
  User.where({id: [1, 2]}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.end()
  }).catch(t.end)
})

test('limit', function (t) {
  User.limit(1).all().then(function (users) {
    t.is(users.length, 1)
    t.end()
  }).catch(t.end)
})

test('order ascending', function (t) {
  User
  .where({id: [1, 2]})
  .order(User.table.id.ascending)
  .all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.end()
  }).catch(t.end)
})

test('order descending', function (t) {
  User
  .where({id: [1, 2]})
  .order(User.table.id.descending)
  .all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [2, 1])
    t.end()
  }).catch(t.end)
})

test('order as string', function (t) {
  User.order('id').all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2, 3])
    t.end()
  }).catch(t.end)
})

test('order as array ascending', function (t) {
  User.order(['id', 'asc']).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2, 3])
    t.end()
  }).catch(t.end)
})

test('order as array descending', function (t) {
  User
  .where({id: [1, 2]})
  .order(['id', 'descending'])
  .all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [2, 1])
    t.end()
  }).catch(t.end)
})

test('where null', function (t) {
  User.where({birthday: null}).all().then(function (users) {
    t.is(users.length, 1)
    t.is(users[0].email, 'jd@example.com')
    t.end()
  }).catch(t.end)
})

test('where string', function (t) {
  User.where({email: 'jd@example.com'}).all().then(function (users) {
    t.is(users.length, 1)
    t.is(users[0].id, 3)
    t.end()
  }).catch(t.end)
})

test('find one', function (t) {
  User.where({id: 3}).find().then(function (user) {
    t.is(user.id, 3)
    t.end()
  }).catch(t.end)
})

test('Model#slice', function (t) {
  let user = new User({
    id: 1,
    email: 'brad@example.com',
    first: 'Brad',
    last: 'Dunbar'
  })
  t.deepEqual(user.slice('first', 'last'), {
    first: 'Brad',
    last: 'Dunbar'
  })
  t.end()
})

test('find post', function (t) {
  Post.find(2).then(function (post) {
    t.is(post.id, 2)
    t.is(post.userId, 2)
    t.end()
  }).catch(t.end)
})

test('include string', function (t) {
  let query = Post.include('user')
  t.deepEqual(query.includes, {
    user: {}
  })
  t.end()
})

test('include array', function (t) {
  let query = Post.include(['user'])
  t.deepEqual(query.includes, {
    user: {}
  })
  t.end()
})

test('include object', function (t) {
  let query = Post.include({user: {}})
  t.deepEqual(query.includes, {
    user: {}
  })
  t.end()
})

test('include multiple levels', function (t) {
  let query = User.include({posts: 'comments'})
  t.deepEqual(query.includes, {
    posts: {comments: {}}
  })
  t.end()
})

test('include multiple levels', function (t) {
  let query = User.include({posts: ['comments']})
  t.deepEqual(query.includes, {
    posts: {comments: {}}
  })
  t.end()
})

test('include multiple levels', function (t) {
  let query = User.include({posts: {comments: {}}})
  t.deepEqual(query.includes, {
    posts: {comments: {}}
  })
  t.end()
})

test('include multiple levels', function (t) {
  let query = User.include({posts: [{comments: {}}]})
  t.deepEqual(query.includes, {
    posts: {comments: {}}
  })
  t.end()
})

test('include belongsTo', function (t) {
  Post.include('user').find(1).then(function (post) {
    t.is(post.id, 1)
    t.is(post.user.id, 1)
    t.end()
  }).catch(t.end)
})

test('include hasMany', function (t) {
  User.include('posts').find(1).then(function (user) {
    t.is(user.id, 1)
    t.is(user.posts.length, 2)
    t.is(user.posts[0].id, 1)
    t.is(user.posts[1].id, 3)
    t.end()
  }).catch(t.end)
})

test('all belongsTo', function (t) {
  Post.include('user').where({id: [1, 2]}).all().then(function (posts) {
    t.is(posts.length, 2)
    t.is(posts[0].user.id, 1)
    t.is(posts[1].user.id, 2)
    t.end()
  }).catch(t.end)
})

test('all hasMany', function (t) {
  User.include('posts').where({id: [1, 2]}).all().then(function (users) {
    t.is(users.length, 2)
    t.is(users[0].posts.length, 2)
    t.deepEqual(users[0].posts.map(function (post) { return post.id }), [1, 3])
    t.is(users[1].posts.length, 2)
    t.deepEqual(users[1].posts.map(function (post) { return post.id }), [2, 4])
    t.end()
  }).catch(t.end)
})

test('two levels', function (t) {
  Comment.include('user', {post: 'user'}).find(1).then(function (comment) {
    t.is(comment.id, 1)
    t.is(comment.user.id, 2)
    t.is(comment.post.id, 1)
    t.is(comment.post.user.id, 1)
    t.end()
  }).catch(t.end)
})

test('three levels', function (t) {
  User.include({posts: {comments: 'user'}}).find(1).then(function (user) {
    t.is(user.id, 1)
    t.is(user.posts.length, 2)
    t.is(user.posts[0].id, 1)
    t.is(user.posts[0].comments.length, 1)
    t.is(user.posts[0].comments[0].id, 1)
    t.is(user.posts[0].comments[0].user.id, 2)
    t.is(user.posts[1].id, 3)
    t.is(user.posts[1].comments.length, 0)
    t.end()
  }).catch(t.end)
})

test('update', function (t) {
  User.find(1).then(function (user) {
    t.is(user.first, 'Brad')
    return db.transaction(function () {
      user.update({first: 'Bradley'})
      User.find(1).then(function (user) {
        t.is(user.first, 'Bradley')
        t.end()
      })
      db.query('rollback')
    })
  }).catch(t.end)
})

test('update with property names', function (t) {
  Post.find(1).then(function (post) {
    t.is(post.id, 1)
    return db.transaction(function () {
      post.update({userId: 2})
      Post.find(1).then(function (post) {
        t.is(post.userId, 2)
        t.end()
      })
      db.query('rollback')
    })
  }).catch(t.end)
})

test('transaction', function (t) {
  Post.find(1).then(function (post) {
    t.is(post.userId, 1)
    return db.transaction(function () {
      post.update({userId: 2})
      Post.find(1).then(function (post) {
        t.is(post.userId, 2)
      })
      db.query('rollback')
    }).then(function () {
      return Post.find(1).then(function (post) {
        t.is(post.userId, 1)
        t.end()
      })
    })
  }).catch(t.end)
})

test('transactions forward errors', function (t) {
  Post.find(1).then(function (post) {
    t.deepEqual(post.slice('id', 'userId'), {id: 1, userId: 1})
    return db.transaction(function () {
      post.destroy()
      db.query('rollback')
    }).then(function () {
      t.end('should get foreign key constraint error')
    }).catch(function (e) {
      t.ok(e)
      t.end()
    })
  }).catch(t.end)
})

test('destroy a comment', function (t) {
  Comment.find(1).then(function (comment) {
    return db.transaction(function () {
      comment.destroy()
      Comment.find(1).then(function (comment) {
        t.is(comment, null)
        t.end()
      })
      db.query('rollback')
    })
  }).catch(t.end)
})

test('create a comment', function (t) {
  db.transaction(function () {
    Comment.create({
      id: 123456789,
      userId: 1,
      postId: 1,
      body: 'blah'
    }).then(check)
    Comment.find(123456789).then(check)
    db.query('rollback')
  }).then(function () { t.end() }).catch(t.end)

  function check (comment) {
    t.deepEqual(comment.slice('id', 'userId', 'postId', 'body'), {
      id: 123456789,
      userId: 1,
      postId: 1,
      body: 'blah'
    })
  }
})

test('no nesting transactions', function (t) {
  db.transaction(function () {
    t.throws(function () {
      db.transaction(function () {
      })
    }, 'transactions cannot be nested')
  }).then(function () { t.end() })
})

test('error in transaction body', function (t) {
  db.transaction(function () {
    throw new Error('error in transaction body')
  }).then(function () {
    t.end('transaction should fail')
  }).catch(function () {
    t.end()
  })
})

test('long transaction', function (t) {
  let transaction = db.transaction()
  User.find(3).then(function (user) {
    t.is(user.first, 'John')
    return update(user)
  }).catch(t.end)

  function update (user) {
    return transaction.run(function () {
      return user.update({first: 'Jane'}).then(verifyJohn)
    })
  }

  function verifyJohn () {
    return User.find(3).then(function (user) {
      t.is(user.first, 'John')
      return verifyJane()
    })
  }

  function verifyJane () {
    return transaction.run(function () {
      return User.find(3).then(function (user) {
        t.is(user.first, 'Jane')
        return commit()
      })
    })
  }

  function commit () {
    return transaction.commit().then(function () {
      t.end()
    })
  }
})
