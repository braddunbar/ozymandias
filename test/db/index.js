'use strict'

let test = require('tape')
let db = require('./db')
let User = require('./user')
let Post = require('./post')
let Comment = require('./comment')

User.hasMany('posts', {model: Post, key: 'userId'})
User.hasMany('comments', {model: Comment, key: 'userId'})
Post.belongsTo('user', {model: User, key: 'userId'})
Post.hasMany('comments', {model: Comment, key: 'postId'})
Comment.belongsTo('user', {model: User, key: 'userId'})
Comment.belongsTo('post', {model: Post, key: 'postId'})

test('connection closed on error', function (t) {
  db.query('this is not valid syntax').then(function () {
    t.end('this should fail')
  }).catch(function () {
    t.end()
  })
})

test('query database', function (t) {
  db.query('select email from users where id = 1').then(function (result) {
    t.deepEqual(result.rows, [{email: 'brad@example.com'}])
    t.end()
  }).catch(t.end)
})

test('query with parameters', function (t) {
  let sql = 'select email from users where id = $1'
  db.query(sql, [1]).then(function (result) {
    t.deepEqual(result.rows, [{email: 'brad@example.com'}])
    t.end()
  }).catch(t.end)
})

test('transaction query with parameters', function (t) {
  let sql = 'select email from users where id = $1'
  db.transaction(function () {
    db.query(sql, [1]).then(function (result) {
      t.deepEqual(result.rows, [{email: 'brad@example.com'}])
      t.end()
    })
  }).catch(t.end)
})

test('transaction promises resolve their return value', function (t) {
  db.transaction(function () {
    return db.query('select email from users where id = $1', [1])
  }).then(function (result) {
    t.deepEqual(result.rows, [{email: 'brad@example.com'}])
    t.end()
  }).catch(t.end)
})

test('transaction promises resolve their return value', function (t) {
  db.transaction(function () { return 57 }).then(function (result) {
    t.is(result, 57)
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

test('where not clause with array', function (t) {
  User.not({id: [1, 2]}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [3])
    t.end()
  }).catch(t.end)
})

test('where not clause with primitive', function (t) {
  User.not({id: 3}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.end()
  }).catch(t.end)
})

test('where not clause with null', function (t) {
  User.not({birthday: null}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.end()
  }).catch(t.end)
})

test('where clause with query', function (t) {
  User.where({id: Comment.select('userId')}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.end()
  }).catch(t.end)
})

test('where not clause with query', function (t) {
  User.not({id: Comment.select('userId')}).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [3])
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

test('where sql', function (t) {
  User.where("email = 'jd@example.com'").all().then(function (users) {
    t.is(users.length, 1)
    t.is(users[0].id, 3)
    t.end()
  }).catch(t.end)
})

test('where sql with values', function (t) {
  User.where('length(first) = ?', 4).all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 3])
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

test('include nothing', function (t) {
  let query = Post.include()
  t.deepEqual(query.includes, {})
  t.end()
})

test('include null', function (t) {
  let query = Post.include(null)
  t.deepEqual(query.includes, {})
  t.end()
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
  Post.include('user').where({id: [1, 2, 3, 4]}).all().then(function (posts) {
    t.is(posts.length, 4)
    t.is(posts[0].user.id, 1)
    t.is(posts[1].user.id, 2)
    t.is(posts[2].user.id, 1)
    t.is(posts[3].user.id, 2)
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
    t.is(user.posts[0].comments.length, 2)
    t.is(user.posts[0].comments[0].id, 1)
    t.is(user.posts[0].comments[0].user.id, 2)
    t.is(user.posts[0].comments[1].id, 2)
    t.is(user.posts[0].comments[1].user.id, 1)
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
      throw new Error('rollback')
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
      throw new Error('rollback')
    })
  }).catch(t.end)
})

test('update throws if invalid', function (t) {
  let user = new User({id: 1})
  try {
    user.update({email: ''})
    t.end('updating should throw if invalid')
  } catch (e) {
    t.is(e.message, 'invalid')
    t.ok(e.model === user, 'should include model with error')
  }
  t.end()
})

test('create fails if invalid', function (t) {
  try {
    User.create({email: '', first: 'joe', last: 'user'})
  } catch (e) {
    t.is(e.message, 'invalid')
    t.ok(e.model instanceof User, 'should include model with error')
  }
  t.end()
})

test('transaction', function (t) {
  Post.find(1).then(function (post) {
    t.is(post.userId, 1)
    return db.transaction(function () {
      post.update({userId: 2})
      Post.find(1).then(function (post) {
        t.is(post.userId, 2)
      })
      throw new Error('rollback')
    }).then(function () {
      return Post.find(1).then(function (post) {
        t.is(post.userId, 1)
        t.end()
      })
    })
  }).catch(t.end)
})

test('Throwing during a transaction returns a rejected promise', function (t) {
  let transaction = db.transaction()
  transaction.run(function () {
    throw new Error('test')
  }).then(function () {
    t.end('promise should be rejected')
  }).catch(function (e) {
    t.is(e.message, 'test')
    t.end()
  })
})

test('transactions forward errors', function (t) {
  Post.find(1).then(function (post) {
    t.deepEqual(post.slice('id', 'userId'), {id: 1, userId: 1})
    return db.transaction(function () {
      post.destroy()
      throw new Error('rollback')
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
      throw new Error('rollback')
    })
  }).catch(t.end)
})

test('destroy several comments', function (t) {
  return db.transaction(function () {
    Comment.where({id: [1, 2]}).delete()
    Comment.where({id: [1, 2]}).all().then(function (comments) {
      t.is(comments.length, 0)
      t.end()
    })
    throw new Error('rollback')
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
    throw new Error('rollback')
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

test('creating sets values from db', function (t) {
  db.transaction(function () {
    User.create({email: 'test@example.com'}).then(function (user) {
      t.is(user.first, '')
      t.is(user.last, '')
      t.ok(user.id != null)
      t.end()
    })
  }).catch(t.end)
})

test('no nesting transactions', function (t) {
  let transaction = db.transaction()
  transaction.run(function () {
    t.throws(function () {
      db.transaction.run()
    }, 'transactions cannot be nested')
    t.end()
  })
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
        return rollback()
      })
    })
  }

  function rollback () {
    return transaction.rollback().then(function () {
      t.end()
    })
  }
})

test('no queries after closing a transaction', function (t) {
  let transaction = db.transaction()
  transaction.commit()
  t.throws(function () { transaction.query('select 1') })
  t.end()
})

test('offset', function (t) {
  Post.offset(2).limit(2).all().then(function (posts) {
    t.deepEqual(posts.map(function (post) { return post.id }), [3, 4])
    t.end()
  }).catch(t.end)
})

test('invalid model', function (t) {
  let user = new User()
  t.ok(!user.valid)
  t.deepEqual(user.errors, {email: ['Email cannot be blank']})
  t.end()
})

test('valid model', function (t) {
  let user = new User({email: 'brad@example.com'})
  t.ok(user.valid)
  t.deepEqual(user.errors, {})
  t.end()
})

test('joins', function (t) {
  Post.join('user').where({user: {birthday: '1985-11-16'}}).all()
  .then(function (posts) {
    t.deepEqual(posts.map(function (post) { return post.id }), [2, 4])
    t.end()
  }).catch(t.end)
})

test('joins', function (t) {
  User.join('posts').where({posts: {published: '2015-07-31'}}).all()
  .then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [2])
    t.end()
  }).catch(t.end)
})

test('nested joins', function (t) {
  User.join({posts: 'comments'}).where({posts: {comments: {userId: 1}}})
  .all().then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1])
    t.end()
  }).catch(t.end)
})

test('sql string as select', function (t) {
  let sql = `(
    select count(*) from comments
    where post_id = posts.id
  )::int as comment_count`

  Post.select('*', sql).find(1).then(function (post) {
    t.is(post.id, 1)
    t.is(post.comment_count, 2)
    t.end()
  }).catch(t.end)
})

test('sql with params as select', function (t) {
  let sql = `(select count(*) from comments
    where post_id = posts.id and user_id = ?)::int as comment_count`

  Post.select('*', [sql, 1]).find(1).then(function (post) {
    t.is(post.id, 1)
    t.is(post.comment_count, 1)
    t.end()
  }).catch(t.end)
})

test('count', function (t) {
  User.count().then(function (count) {
    t.is(count, 4)
    t.end()
  }).catch(t.end)
})

test('count with where', function (t) {
  User.where('id < 3').count().then(function (count) {
    t.is(count, 2)
    t.end()
  }).catch(t.end)
})

test('first page with more', function (t) {
  User.paginate(1, 2).then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [1, 2])
    t.is(users.more, true)
    t.end()
  }).catch(t.end)
})

test('second page without more', function (t) {
  User.paginate(2, 2).then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [3, 4])
    t.is(users.more, false)
    t.end()
  }).catch(t.end)
})

test('second page with less than count', function (t) {
  User.paginate(2, 3).then(function (users) {
    t.deepEqual(users.map(function (user) { return user.id }), [4])
    t.is(users.more, false)
    t.end()
  }).catch(t.end)
})

test('group by', function (t) {
  User.join('posts').select('count(posts.id)::int as post_count').groupBy('users.id')
  .order('id').all().then(function (users) {
    t.deepEqual(users.map(user => [user.id, user.post_count]), [[1, 2], [2, 2]])
    t.end()
  }).catch(t.end)
})

test('left join', function (t) {
  User.leftJoin('posts').select('count(posts.id)::int as post_count').groupBy('users.id')
  .order('id').all().then(function (users) {
    t.deepEqual(users.map(user => [user.id, user.post_count]), [[1, 2], [2, 2], [3, 0], [4, 0]])
    t.end()
  }).catch(t.end)
})
