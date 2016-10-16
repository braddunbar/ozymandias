'use strict'

const db = require('../../db/instance')
const test = require('../test')
const User = require('./user')
const Post = require('./post')
const Comment = require('./comment')

test('child tables must be distinct', function *(t) {
  class Child extends User {}
  t.ok(User.table !== Child.table)
  t.end()
})

test('child relations must be distinct', function *(t) {
  class Child extends User {}
  t.ok(User.relations !== Child.relations)
  t.end()
})

test('connection closed on error', function *(t) {
  try {
    yield db.query('this is not valid syntax')
    t.end('this should fail')
  } catch (error) {
    t.end()
  }
})

test('query database', function *(t) {
  const {rows} = yield db.query('select email from users where id = 1')
  t.deepEqual(rows, [{email: 'brad@example.com'}])
  t.end()
})

test('query with parameters', function *(t) {
  const sql = 'select email from users where id = $1'
  const {rows} = yield db.query(sql, [1])
  t.deepEqual(rows, [{email: 'brad@example.com'}])
  t.end()
})

test('create a new model with data', function *(t) {
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

test('create model without data', function *(t) {
  let user = new User()
  t.is(user.id, undefined)
  t.is(user.email, undefined)
  t.is(user.first, undefined)
  t.is(user.last, undefined)
  t.end()
})

test('use a setter', function *(t) {
  let user = new User()
  user.email = ' brad@example.com '
  t.is(user.email, 'brad@example.com')
  t.end()
})

test('toJSON is an empty object by default', function *(t) {
  const user = new User({email: 'brad@example.com'})
  t.is(JSON.stringify(user), '{}')
  t.end()
})

test('find a user', function *(t) {
  const user = yield User.find(1)
  t.is(user.id, 1)
  t.is(user.email, 'brad@example.com')
  t.is(user.first, 'Brad')
  t.is(user.last, 'Dunbar')
  t.end()
})

test('find a non-existent user', function *(t) {
  const user = yield User.find(123456789)
  t.is(user, null)
  t.end()
})

test('find all users with where clause', function *(t) {
  const users = yield User.where({id: 1}).all()
  t.is(users.length, 1)
  t.is(users[0].id, 1)
  t.is(users[0].email, 'brad@example.com')
  t.is(users[0].first, 'Brad')
  t.is(users[0].last, 'Dunbar')
  t.end()
})

test('where clause with array', function *(t) {
  const users = yield User.where({id: [1, 2]}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.end()
})

test('where not clause with array', function *(t) {
  const users = yield User.not({id: [1, 2]}).all()
  t.deepEqual(users.map((user) => user.id), [3, 4])
  t.end()
})

test('where not clause with primitive', function *(t) {
  const users = yield User.not({id: 3}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 4])
  t.end()
})

test('where not clause with null', function *(t) {
  const users = yield User.not({birthday: null}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.end()
})

test('where clause with query', function *(t) {
  const users = yield User.where({id: Comment.select('userId')}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.end()
})

test('where not clause with query', function *(t) {
  const users = yield User.not({id: Comment.select('userId')}).all()
  t.deepEqual(users.map((user) => user.id), [3, 4])
  t.end()
})

test('limit', function *(t) {
  const users = yield User.limit(1).all()
  t.is(users.length, 1)
  t.end()
})

test('order ascending', function *(t) {
  const users = yield User
    .where({id: [1, 2]})
    .order(User.table.id.ascending)
    .all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.end()
})

test('order descending', function *(t) {
  const users = yield User
    .where({id: [1, 2]})
    .order(User.table.id.descending)
    .all()
  t.deepEqual(users.map((user) => user.id), [2, 1])
  t.end()
})

test('order as string', function *(t) {
  const users = yield User.order('id').all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
  t.end()
})

test('order as array ascending', function *(t) {
  const users = yield User.order(['id', 'asc']).all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
  t.end()
})

test('order as array descending', function *(t) {
  const users = yield User
    .where({id: [1, 2]})
    .order(['id', 'descending'])
    .all()
  t.deepEqual(users.map((user) => user.id), [2, 1])
  t.end()
})

test('where null', function *(t) {
  const users = yield User.where({birthday: null}).all()
  t.is(users.length, 2)
  t.is(users[0].email, 'jd@example.com')
  t.is(users[1].email, 'test@example.com')
  t.end()
})

test('where string', function *(t) {
  const users = yield User.where({email: 'jd@example.com'}).all()
  t.is(users.length, 1)
  t.is(users[0].id, 3)
  t.end()
})

test('where sql', function *(t) {
  const users = yield User.where("email = 'jd@example.com'").all()
  t.is(users.length, 1)
  t.is(users[0].id, 3)
  t.end()
})

test('where sql with values', function *(t) {
  const users = yield User.where('length(first) = ?', 4).all()
  t.deepEqual(users.map((user) => user.id), [1, 3])
  t.end()
})

test('find one', function *(t) {
  const user = yield User.where({id: 3}).find()
  t.is(user.id, 3)
  t.end()
})

test('Model#slice', function *(t) {
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

test('find post', function *(t) {
  const post = yield Post.find(2)
  t.is(post.id, 2)
  t.is(post.userId, 2)
  t.end()
})

test('include nothing', function *(t) {
  const query = Post.include()
  t.deepEqual(query.includes, {})
  t.end()
})

test('include null', function *(t) {
  const query = Post.include(null)
  t.deepEqual(query.includes, {})
  t.end()
})

test('include string', function *(t) {
  const query = Post.include('user')
  t.deepEqual(query.includes, {user: {}})
  t.end()
})

test('include array', function *(t) {
  const query = Post.include(['user'])
  t.deepEqual(query.includes, {user: {}})
  t.end()
})

test('include object', function *(t) {
  const query = Post.include({user: {}})
  t.deepEqual(query.includes, {user: {}})
  t.end()
})

test('include multiple levels', function *(t) {
  const query = User.include({posts: 'comments'})
  t.deepEqual(query.includes, {posts: {comments: {}}})
  t.end()
})

test('include multiple levels', function *(t) {
  const query = User.include({posts: ['comments']})
  t.deepEqual(query.includes, {posts: {comments: {}}})
  t.end()
})

test('include multiple levels', function *(t) {
  const query = User.include({posts: {comments: {}}})
  t.deepEqual(query.includes, {posts: {comments: {}}})
  t.end()
})

test('include multiple levels', function *(t) {
  const query = User.include({posts: [{comments: {}}]})
  t.deepEqual(query.includes, {posts: {comments: {}}})
  t.end()
})

test('include belongsTo', function *(t) {
  const post = yield Post.include('user').find(1)
  t.is(post.id, 1)
  t.is(post.user.id, 1)
  t.end()
})

test('include hasMany', function *(t) {
  const user = yield User.include('posts').find(1)
  t.is(user.id, 1)
  t.is(user.posts.length, 2)
  t.is(user.posts[0].id, 1)
  t.is(user.posts[1].id, 3)
  t.end()
})

test('all belongsTo', function *(t) {
  const posts = yield Post.include('user').where({id: [1, 2, 3, 4]}).all()
  t.is(posts.length, 4)
  t.is(posts[0].user.id, 1)
  t.is(posts[1].user.id, 2)
  t.is(posts[2].user.id, 1)
  t.is(posts[3].user.id, 2)
  t.end()
})

test('all hasMany', function *(t) {
  const users = yield User.include('posts').where({id: [1, 2]}).all()
  t.is(users.length, 2)
  t.is(users[0].posts.length, 2)
  t.deepEqual(users[0].posts.map((post) => post.id), [1, 3])
  t.is(users[1].posts.length, 2)
  t.deepEqual(users[1].posts.map((post) => post.id), [2, 4])
  t.end()
})

test('two levels', function *(t) {
  const comment = yield Comment.include('user', {post: 'user'}).find(1)
  t.is(comment.id, 1)
  t.is(comment.user.id, 2)
  t.is(comment.post.id, 1)
  t.is(comment.post.user.id, 1)
  t.end()
})

test('three levels', function *(t) {
  const user = yield User.include({posts: {comments: 'user'}}).find(1)
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
})

test('update', function *(t) {
  let user = yield User.find(1)
  t.is(user.first, 'Brad')
  yield user.update({first: 'Bradley'})
  user = yield User.find(1)
  t.is(user.first, 'Bradley')
  t.end()
})

test('update with property names', function *(t) {
  let post = yield Post.find(1)
  t.is(post.id, 1)
  yield post.update({userId: 2})
  post = yield Post.find(1)
  t.is(post.userId, 2)
  t.end()
})

test('update rejects when invalid', function *(t) {
  try {
    yield new User({id: 1}).update({email: ''})
    t.fail('update should reject when invalid')
  } catch (error) {
    t.is(error.message, 'invalid')
    t.ok(error.model instanceof User, 'should include model with error')
    t.end()
  }
})

test('create rejects when invalid', function *(t) {
  try {
    yield User.create({email: '', first: 'joe', last: 'user'})
    t.fail('create should reject when invalid')
  } catch (error) {
    t.is(error.message, 'invalid')
    t.ok(error.model instanceof User, 'should include model with error')
    t.end()
  }
})

test('destroy a comment', function *(t) {
  const comment = yield Comment.find(1)
  yield comment.destroy()
  t.is(yield Comment.find(1), null)
  t.end()
})

test('destroy several comments', function *(t) {
  yield Comment.where({id: [1, 2]}).delete()
  const comments = yield Comment.where({id: [1, 2]}).all()
  t.is(comments.length, 0)
  t.end()
})

test('create a comment', function *(t) {
  yield Comment.create({
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
  const comment = yield Comment.find(123456789)
  t.deepEqual(comment.slice('id', 'userId', 'postId', 'body'), {
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
  t.end()
})

test('creating sets values from db', function *(t) {
  const user = yield User.create({email: 'user@example.com'})
  t.is(user.first, '')
  t.is(user.last, '')
  t.ok(user.id != null)
  t.end()
})

test('offset', function *(t) {
  const posts = yield Post.order('id').offset(2).limit(2).all()
  t.deepEqual(posts.map((post) => post.id), [3, 4])
  t.end()
})

test('invalid model', function *(t) {
  const user = new User()
  t.ok(!user.valid)
  t.deepEqual(user.errors, {email: ['Email cannot be blank']})
  t.end()
})

test('valid model', function *(t) {
  const user = new User({email: 'brad@example.com'})
  t.ok(user.valid)
  t.deepEqual(user.errors, {})
  t.end()
})

test('joins', function *(t) {
  const posts = yield Post.join('user')
    .where({user: {birthday: '1985-11-16'}})
    .all()
  t.deepEqual(posts.map((post) => post.id), [2, 4])
  t.end()
})

test('joins', function *(t) {
  const users = yield User.join('posts')
    .where({posts: {published: '2015-07-31'}})
    .all()
  t.deepEqual(users.map((user) => user.id), [2])
  t.end()
})

test('nested joins', function *(t) {
  const users = yield User.join({posts: 'comments'})
    .where({posts: {comments: {userId: 1}}})
    .all()
  t.deepEqual(users.map((user) => user.id), [1])
  t.end()
})

test('sql string as select', function *(t) {
  const sql = `(
    select count(*) from comments
    where post_id = posts.id
  )::int as comment_count`

  const post = yield Post.select('*', sql).find(1)
  t.is(post.id, 1)
  t.is(post.comment_count, 2)
  t.end()
})

test('sql with params as select', function *(t) {
  const sql = `(select count(*) from comments
    where post_id = posts.id and user_id = ?)::int as comment_count`

  const post = yield Post.select('*', [sql, 1]).find(1)
  t.is(post.id, 1)
  t.is(post.comment_count, 1)
  t.end()
})

test('count', function *(t) {
  t.is(yield User.count(), 4)
  t.end()
})

test('count with where', function *(t) {
  t.is(yield User.where('id < 3').count(), 2)
  t.end()
})

test('first page with more', function *(t) {
  const users = yield User.paginate(1, 2)
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.is(users.more, true)
  t.end()
})

test('second page without more', function *(t) {
  const users = yield User.paginate(2, 2)
  t.deepEqual(users.map((user) => user.id), [3, 4])
  t.is(users.more, false)
  t.end()
})

test('second page with less than count', function *(t) {
  const users = yield User.paginate(2, 3)
  t.deepEqual(users.map((user) => user.id), [4])
  t.is(users.more, false)
  t.end()
})

test('group by', function *(t) {
  const users = yield User.join('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  t.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2]])
  t.end()
})

test('left join', function *(t) {
  const users = yield User
    .leftJoin('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  t.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2], [3, 0], [4, 0]])
  t.end()
})
