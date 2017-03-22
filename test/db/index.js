'use strict'

const db = require('../../db/instance')
const test = require('../test')
const User = require('./user')
const Post = require('./post')
const Comment = require('./comment')

test('connection closed on error', async (t) => {
  try {
    await db.query('this is not valid syntax')
    t.fail('this should fail')
  } catch (error) { }
})

test('child tables must be distinct', async (t) => {
  class Child extends User {}
  t.ok(User.table !== Child.table)
})

test('child relations must be distinct', async (t) => {
  class Child extends User {}
  t.ok(User.relations !== Child.relations)
})

test('query database', async (t) => {
  const {rows} = await db.query('select email from users where id = 1')
  t.deepEqual(rows, [{email: 'brad@example.com'}])
})

test('query with parameters', async (t) => {
  const sql = 'select email from users where id = $1'
  const {rows} = await db.query(sql, [1])
  t.deepEqual(rows, [{email: 'brad@example.com'}])
})

test('create a new model with data', async (t) => {
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
})

test('create model without data', async (t) => {
  let user = new User()
  t.is(user.id, undefined)
  t.is(user.email, undefined)
  t.is(user.first, undefined)
  t.is(user.last, undefined)
})

test('use a setter', async (t) => {
  let user = new User()
  user.email = ' brad@example.com '
  t.is(user.email, 'brad@example.com')
})

test('toJSON is an empty object by default', async (t) => {
  const user = new User({email: 'brad@example.com'})
  t.is(JSON.stringify(user), '{}')
})

test('find a user', async (t) => {
  const user = await User.find(1)
  t.is(user.id, 1)
  t.is(user.email, 'brad@example.com')
  t.is(user.first, 'Brad')
  t.is(user.last, 'Dunbar')
})

test('find a non-existent user', async (t) => {
  const user = await User.find(123456789)
  t.is(user, null)
})

test('find all users with where clause', async (t) => {
  const users = await User.where({id: 1}).all()
  t.is(users.length, 1)
  t.is(users[0].id, 1)
  t.is(users[0].email, 'brad@example.com')
  t.is(users[0].first, 'Brad')
  t.is(users[0].last, 'Dunbar')
})

test('where clause with array', async (t) => {
  const users = await User.where({id: [1, 2]}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where not clause with array', async (t) => {
  const users = await User.not({id: [1, 2]}).all()
  t.deepEqual(users.map((user) => user.id), [3, 4])
})

test('where not clause with primitive', async (t) => {
  const users = await User.not({id: 3}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 4])
})

test('where not clause with null', async (t) => {
  const users = await User.not({birthday: null}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where clause with query', async (t) => {
  const users = await User.where({id: Comment.select('userId')}).all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where not clause with query', async (t) => {
  const users = await User.not({id: Comment.select('userId')}).all()
  t.deepEqual(users.map((user) => user.id), [3, 4])
})

test('limit', async (t) => {
  const users = await User.limit(1).all()
  t.is(users.length, 1)
})

test('order ascending', async (t) => {
  const users = await User
    .where({id: [1, 2]})
    .order(User.table.id.ascending)
    .all()
  t.deepEqual(users.map((user) => user.id), [1, 2])
})

test('order descending', async (t) => {
  const users = await User
    .where({id: [1, 2]})
    .order(User.table.id.descending)
    .all()
  t.deepEqual(users.map((user) => user.id), [2, 1])
})

test('order as string', async (t) => {
  const users = await User.order('id').all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
})

test('order as array ascending', async (t) => {
  const users = await User.order(['id', 'asc']).all()
  t.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
})

test('order as array descending', async (t) => {
  const users = await User
    .where({id: [1, 2]})
    .order(['id', 'descending'])
    .all()
  t.deepEqual(users.map((user) => user.id), [2, 1])
})

test('where null', async (t) => {
  const users = await User.where({birthday: null}).all()
  t.is(users.length, 2)
  t.is(users[0].email, 'jd@example.com')
  t.is(users[1].email, 'test@example.com')
})

test('where string', async (t) => {
  const users = await User.where({email: 'jd@example.com'}).all()
  t.is(users.length, 1)
  t.is(users[0].id, 3)
})

test('where sql', async (t) => {
  const users = await User.where("email = 'jd@example.com'").all()
  t.is(users.length, 1)
  t.is(users[0].id, 3)
})

test('where sql with values', async (t) => {
  const users = await User.where('length(first) = ?', 4).all()
  t.deepEqual(users.map((user) => user.id), [1, 3])
})

test('find one', async (t) => {
  const user = await User.where({id: 3}).find()
  t.is(user.id, 3)
})

test('Model#slice', async (t) => {
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
})

test('find post', async (t) => {
  const post = await Post.find(2)
  t.is(post.id, 2)
  t.is(post.userId, 2)
})

test('include nothing', async (t) => {
  const query = Post.include()
  t.deepEqual(query.includes, {})
})

test('include null', async (t) => {
  const query = Post.include(null)
  t.deepEqual(query.includes, {})
})

test('include string', async (t) => {
  const query = Post.include('user')
  t.deepEqual(query.includes, {user: {}})
})

test('include array', async (t) => {
  const query = Post.include(['user'])
  t.deepEqual(query.includes, {user: {}})
})

test('include object', async (t) => {
  const query = Post.include({user: {}})
  t.deepEqual(query.includes, {user: {}})
})

test('include multiple levels', async (t) => {
  const query = User.include({posts: 'comments'})
  t.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async (t) => {
  const query = User.include({posts: ['comments']})
  t.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async (t) => {
  const query = User.include({posts: {comments: {}}})
  t.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async (t) => {
  const query = User.include({posts: [{comments: {}}]})
  t.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include belongsTo', async (t) => {
  const post = await Post.include('user').find(1)
  t.is(post.id, 1)
  t.is(post.user.id, 1)
})

test('include hasMany', async (t) => {
  const user = await User.include('posts').find(1)
  t.is(user.id, 1)
  t.is(user.posts.length, 2)
  t.is(user.posts[0].id, 1)
  t.is(user.posts[1].id, 3)
})

test('all belongsTo', async (t) => {
  const posts = await Post.include('user').where({id: [1, 2, 3, 4]}).all()
  t.is(posts.length, 4)
  t.is(posts[0].user.id, 1)
  t.is(posts[1].user.id, 2)
  t.is(posts[2].user.id, 1)
  t.is(posts[3].user.id, 2)
})

test('all hasMany', async (t) => {
  const users = await User.include('posts').where({id: [1, 2]}).all()
  t.is(users.length, 2)
  t.is(users[0].posts.length, 2)
  t.deepEqual(users[0].posts.map((post) => post.id), [1, 3])
  t.is(users[1].posts.length, 2)
  t.deepEqual(users[1].posts.map((post) => post.id), [2, 4])
})

test('two levels', async (t) => {
  const comment = await Comment.include('user', {post: 'user'}).find(1)
  t.is(comment.id, 1)
  t.is(comment.user.id, 2)
  t.is(comment.post.id, 1)
  t.is(comment.post.user.id, 1)
})

test('three levels', async (t) => {
  const user = await User.include({posts: {comments: 'user'}}).find(1)
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
})

test('update', async (t) => {
  let user = await User.find(1)
  t.is(user.first, 'Brad')
  await user.update({first: 'Bradley'})
  user = await User.find(1)
  t.is(user.first, 'Bradley')
})

test('update with property names', async (t) => {
  let post = await Post.find(1)
  t.is(post.id, 1)
  await post.update({userId: 2})
  post = await Post.find(1)
  t.is(post.userId, 2)
})

test('update rejects when invalid', async (t) => {
  try {
    await new User({id: 1}).update({email: ''})
    t.fail('update should reject when invalid')
  } catch (error) {
    t.is(error.message, 'invalid')
    t.ok(error.model instanceof User, 'should include model with error')
  }
})

test('create rejects when invalid', async (t) => {
  try {
    await User.create({email: '', first: 'joe', last: 'user'})
    t.fail('create should reject when invalid')
  } catch (error) {
    t.is(error.message, 'invalid')
    t.ok(error.model instanceof User, 'should include model with error')
  }
})

test('destroy a comment', async (t) => {
  const comment = await Comment.find(1)
  await comment.destroy()
  t.is(await Comment.find(1), null)
})

test('destroy several comments', async (t) => {
  await Comment.where({id: [1, 2]}).delete()
  const comments = await Comment.where({id: [1, 2]}).all()
  t.is(comments.length, 0)
})

test('create a comment', async (t) => {
  await Comment.create({
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
  const comment = await Comment.find(123456789)
  t.deepEqual(comment.slice('id', 'userId', 'postId', 'body'), {
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
})

test('creating sets values from db', async (t) => {
  const user = await User.create({email: 'user@example.com'})
  t.is(user.first, '')
  t.is(user.last, '')
  t.ok(user.id != null)
})

test('offset', async (t) => {
  const posts = await Post.order('id').offset(2).limit(2).all()
  t.deepEqual(posts.map((post) => post.id), [3, 4])
})

test('invalid model', async (t) => {
  const user = new User()
  t.ok(!user.valid)
  t.deepEqual(user.errors, {email: ['Email cannot be blank']})
})

test('valid model', async (t) => {
  const user = new User({email: 'brad@example.com'})
  t.ok(user.valid)
  t.deepEqual(user.errors, {})
})

test('joins', async (t) => {
  const posts = await Post.join('user')
    .where({user: {birthday: '1985-11-16'}})
    .all()
  t.deepEqual(posts.map((post) => post.id), [2, 4])
})

test('joins', async (t) => {
  const users = await User.join('posts')
    .where({posts: {published: '2015-07-31'}})
    .all()
  t.deepEqual(users.map((user) => user.id), [2])
})

test('nested joins', async (t) => {
  const users = await User.join({posts: 'comments'})
    .where({posts: {comments: {userId: 1}}})
    .all()
  t.deepEqual(users.map((user) => user.id), [1])
})

test('sql string as select', async (t) => {
  const sql = `(
    select count(*) from comments
    where post_id = posts.id
  )::int as comment_count`

  const post = await Post.select('*', sql).find(1)
  t.is(post.id, 1)
  t.is(post.comment_count, 2)
})

test('sql with params as select', async (t) => {
  const sql = `(select count(*) from comments
    where post_id = posts.id and user_id = ?)::int as comment_count`

  const post = await Post.select('*', [sql, 1]).find(1)
  t.is(post.id, 1)
  t.is(post.comment_count, 1)
})

test('count', async (t) => {
  t.is(await User.count(), 4)
})

test('count with where', async (t) => {
  t.is(await User.where('id < 3').count(), 2)
})

test('first page with more', async (t) => {
  const users = await User.paginate(1, 2)
  t.deepEqual(users.map((user) => user.id), [1, 2])
  t.is(users.more, true)
})

test('second page without more', async (t) => {
  const users = await User.paginate(2, 2)
  t.deepEqual(users.map((user) => user.id), [3, 4])
  t.is(users.more, false)
})

test('second page with less than count', async (t) => {
  const users = await User.paginate(2, 3)
  t.deepEqual(users.map((user) => user.id), [4])
  t.is(users.more, false)
})

test('group by', async (t) => {
  const users = await User.join('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  t.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2]])
})

test('left join', async (t) => {
  const users = await User
    .leftJoin('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  t.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2], [3, 0], [4, 0]])
})

test('search', async (t) => {
  const posts = await Post.search('lorem').all()
  t.is(posts.length, 1)
  t.deepEqual(posts.map(({id}) => id), [1])
})

test('search with ampersand', async (t) => {
  const posts = await Post.search('lorem & ipsum').all()
  t.is(posts.length, 1)
  t.deepEqual(posts.map(({id}) => id), [1])
})
