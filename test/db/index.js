'use strict'

const db = require('../../db/instance')
const test = require('../test')
const User = require('./user')
const Post = require('./post')
const Comment = require('./comment')

test('connection closed on error', async ({assert}) => {
  try {
    await db.query('this is not valid syntax')
    assert.fail('this should fail')
  } catch (error) { }
})

test('child tables must be distinct', async ({assert}) => {
  class Child extends User {}
  assert.ok(User.table !== Child.table)
})

test('child relations must be distinct', async ({assert}) => {
  class Child extends User {}
  assert.ok(User.relations !== Child.relations)
})

test('query database', async ({assert}) => {
  const {rows} = await db.query('select email from users where id = 1')
  assert.deepEqual(rows, [{email: 'brad@example.com'}])
})

test('query with parameters', async ({assert}) => {
  const sql = 'select email from users where id = $1'
  const {rows} = await db.query(sql, [1])
  assert.deepEqual(rows, [{email: 'brad@example.com'}])
})

test('create a new model with data', async ({assert}) => {
  let user = new User({
    id: 1,
    email: ' brad@example.com ',
    first: 'Brad',
    last: 'Dunbar'
  })
  assert.is(user.id, 1)
  assert.is(user.email, 'brad@example.com')
  assert.is(user.first, 'Brad')
  assert.is(user.last, 'Dunbar')
})

test('create model without data', async ({assert}) => {
  let user = new User()
  assert.is(user.id, undefined)
  assert.is(user.email, undefined)
  assert.is(user.first, undefined)
  assert.is(user.last, undefined)
})

test('use a setter', async ({assert}) => {
  let user = new User()
  user.email = ' brad@example.com '
  assert.is(user.email, 'brad@example.com')
})

test('toJSON is an empty object by default', async ({assert}) => {
  const user = new User({email: 'brad@example.com'})
  assert.is(JSON.stringify(user), '{}')
})

test('find a user', async ({assert}) => {
  const user = await User.find(1)
  assert.is(user.id, 1)
  assert.is(user.email, 'brad@example.com')
  assert.is(user.first, 'Brad')
  assert.is(user.last, 'Dunbar')
})

test('find a non-existent user', async ({assert}) => {
  const user = await User.find(123456789)
  assert.is(user, null)
})

test('find all users with where clause', async ({assert}) => {
  const users = await User.where({id: 1}).all()
  assert.is(users.length, 1)
  assert.is(users[0].id, 1)
  assert.is(users[0].email, 'brad@example.com')
  assert.is(users[0].first, 'Brad')
  assert.is(users[0].last, 'Dunbar')
})

test('where clause with array', async ({assert}) => {
  const users = await User.where({id: [1, 2]}).all()
  assert.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where not clause with array', async ({assert}) => {
  const users = await User.not({id: [1, 2]}).all()
  assert.deepEqual(users.map((user) => user.id), [3, 4])
})

test('where not clause with primitive', async ({assert}) => {
  const users = await User.not({id: 3}).all()
  assert.deepEqual(users.map((user) => user.id), [1, 2, 4])
})

test('where not clause with null', async ({assert}) => {
  const users = await User.not({birthday: null}).all()
  assert.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where clause with query', async ({assert}) => {
  const users = await User.where({id: Comment.select('userId')}).all()
  assert.deepEqual(users.map((user) => user.id), [1, 2])
})

test('where not clause with query', async ({assert}) => {
  const users = await User.not({id: Comment.select('userId')}).all()
  assert.deepEqual(users.map((user) => user.id), [3, 4])
})

test('limit', async ({assert}) => {
  const users = await User.limit(1).all()
  assert.is(users.length, 1)
})

test('order ascending', async ({assert}) => {
  const users = await User
    .where({id: [1, 2]})
    .order(User.table.id.ascending)
    .all()
  assert.deepEqual(users.map((user) => user.id), [1, 2])
})

test('order descending', async ({assert}) => {
  const users = await User
    .where({id: [1, 2]})
    .order(User.table.id.descending)
    .all()
  assert.deepEqual(users.map((user) => user.id), [2, 1])
})

test('order as string', async ({assert}) => {
  const users = await User.order('id').all()
  assert.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
})

test('order as array ascending', async ({assert}) => {
  const users = await User.order(['id', 'asc']).all()
  assert.deepEqual(users.map((user) => user.id), [1, 2, 3, 4])
})

test('order as array descending', async ({assert}) => {
  const users = await User
    .where({id: [1, 2]})
    .order(['id', 'descending'])
    .all()
  assert.deepEqual(users.map((user) => user.id), [2, 1])
})

test('where null', async ({assert}) => {
  const users = await User.where({birthday: null}).all()
  assert.deepEqual(users.map(({email}) => email), [
    'jd@example.com',
    'test@example.com'
  ])
})

test('where string', async ({assert}) => {
  const users = await User.where({email: 'jd@example.com'}).all()
  assert.is(users.length, 1)
  assert.is(users[0].id, 3)
})

test('where sql', async ({assert}) => {
  const users = await User.where("email = 'jd@example.com'").all()
  assert.is(users.length, 1)
  assert.is(users[0].id, 3)
})

test('where sql with values', async ({assert}) => {
  const users = await User.where('length(first) = ?', 4).all()
  assert.deepEqual(users.map((user) => user.id), [1, 3])
})

test('find one', async ({assert}) => {
  const user = await User.where({id: 3}).find()
  assert.is(user.id, 3)
})

test('Model#slice', async ({assert}) => {
  let user = new User({
    id: 1,
    email: 'brad@example.com',
    first: 'Brad',
    last: 'Dunbar'
  })
  assert.deepEqual(user.slice('first', 'last'), {
    first: 'Brad',
    last: 'Dunbar'
  })
})

test('find post', async ({assert}) => {
  const post = await Post.find(2)
  assert.is(post.id, 2)
  assert.is(post.userId, 2)
})

test('include nothing', async ({assert}) => {
  const query = Post.include()
  assert.deepEqual(query.includes, {})
})

test('include null', async ({assert}) => {
  const query = Post.include(null)
  assert.deepEqual(query.includes, {})
})

test('include string', async ({assert}) => {
  const query = Post.include('user')
  assert.deepEqual(query.includes, {user: {}})
})

test('include array', async ({assert}) => {
  const query = Post.include(['user'])
  assert.deepEqual(query.includes, {user: {}})
})

test('include object', async ({assert}) => {
  const query = Post.include({user: {}})
  assert.deepEqual(query.includes, {user: {}})
})

test('include multiple levels', async ({assert}) => {
  const query = User.include({posts: 'comments'})
  assert.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async ({assert}) => {
  const query = User.include({posts: ['comments']})
  assert.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async ({assert}) => {
  const query = User.include({posts: {comments: {}}})
  assert.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include multiple levels', async ({assert}) => {
  const query = User.include({posts: [{comments: {}}]})
  assert.deepEqual(query.includes, {posts: {comments: {}}})
})

test('include belongsTo', async ({assert}) => {
  const post = await Post.include('user').find(1)
  assert.is(post.id, 1)
  assert.is(post.user.id, 1)
})

test('include hasMany', async ({assert}) => {
  const user = await User.include('posts').find(1)
  assert.is(user.id, 1)
  assert.deepEqual(user.posts.map(({id}) => id), [1, 3])
})

test('all belongsTo', async ({assert}) => {
  const posts = await Post.include('user').where({id: [1, 2, 3, 4]}).all()
  assert.deepEqual(posts.map(({user}) => user.id), [1, 2, 1, 2])
})

test('all hasMany', async ({assert}) => {
  const users = await User.include('posts').where({id: [1, 2]}).all()
  assert.is(users.length, 2)
  assert.is(users[0].posts.length, 2)
  assert.deepEqual(users[0].posts.map((post) => post.id), [1, 3])
  assert.is(users[1].posts.length, 2)
  assert.deepEqual(users[1].posts.map((post) => post.id), [2, 4])
})

test('two levels', async ({assert}) => {
  const comment = await Comment.include('user', {post: 'user'}).find(1)
  assert.is(comment.id, 1)
  assert.is(comment.user.id, 2)
  assert.is(comment.post.id, 1)
  assert.is(comment.post.user.id, 1)
})

test('three levels', async ({assert}) => {
  const user = await User.include({posts: {comments: 'user'}}).find(1)
  assert.is(user.id, 1)
  assert.is(user.posts.length, 2)
  assert.is(user.posts[0].id, 1)
  assert.is(user.posts[0].comments.length, 2)
  assert.is(user.posts[0].comments[0].id, 1)
  assert.is(user.posts[0].comments[0].user.id, 2)
  assert.is(user.posts[0].comments[1].id, 2)
  assert.is(user.posts[0].comments[1].user.id, 1)
  assert.is(user.posts[1].id, 3)
  assert.is(user.posts[1].comments.length, 0)
})

test('update', async ({assert}) => {
  let user = await User.find(1)
  assert.is(user.first, 'Brad')
  await user.update({first: 'Bradley'})
  user = await User.find(1)
  assert.is(user.first, 'Bradley')
})

test('update with property names', async ({assert}) => {
  let post = await Post.find(1)
  assert.is(post.id, 1)
  await post.update({userId: 2})
  post = await Post.find(1)
  assert.is(post.userId, 2)
})

test('update rejects when invalid', async ({assert}) => {
  try {
    await new User({id: 1}).update({email: ''})
    assert.fail('update should reject when invalid')
  } catch (error) {
    assert.is(error.message, 'invalid')
    assert.ok(error.model instanceof User, 'should include model with error')
  }
})

test('create rejects when invalid', async ({assert}) => {
  try {
    await User.create({email: '', first: 'joe', last: 'user'})
    assert.fail('create should reject when invalid')
  } catch (error) {
    assert.is(error.message, 'invalid')
    assert.ok(error.model instanceof User, 'should include model with error')
  }
})

test('destroy a comment', async ({assert}) => {
  const comment = await Comment.find(1)
  await comment.destroy()
  assert.is(await Comment.find(1), null)
})

test('destroy several comments', async ({assert}) => {
  await Comment.where({id: [1, 2]}).delete()
  const comments = await Comment.where({id: [1, 2]}).all()
  assert.is(comments.length, 0)
})

test('create a comment', async ({assert}) => {
  await Comment.create({
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
  const comment = await Comment.find(123456789)
  assert.deepEqual(comment.slice('id', 'userId', 'postId', 'body'), {
    id: 123456789,
    userId: 1,
    postId: 1,
    body: 'blah'
  })
})

test('creating sets values from db', async ({assert}) => {
  const user = await User.create({email: 'user@example.com'})
  assert.is(user.first, '')
  assert.is(user.last, '')
  assert.ok(user.id != null)
})

test('offset', async ({assert}) => {
  const posts = await Post.order('id').offset(2).limit(2).all()
  assert.deepEqual(posts.map((post) => post.id), [3, 4])
})

test('invalid model', async ({assert}) => {
  const user = new User()
  assert.ok(!user.valid)
  assert.deepEqual(user.errors, {email: ['Email cannot be blank']})
})

test('valid model', async ({assert}) => {
  const user = new User({email: 'brad@example.com'})
  assert.ok(user.valid)
  assert.deepEqual(user.errors, {})
})

test('joins', async ({assert}) => {
  const posts = await Post.join('user')
    .where({user: {birthday: '1985-11-16'}})
    .all()
  assert.deepEqual(posts.map((post) => post.id), [2, 4])
})

test('joins', async ({assert}) => {
  const users = await User.join('posts')
    .where({posts: {published: '2015-07-31'}})
    .all()
  assert.deepEqual(users.map((user) => user.id), [2])
})

test('nested joins', async ({assert}) => {
  const users = await User.join({posts: 'comments'})
    .where({posts: {comments: {userId: 1}}})
    .all()
  assert.deepEqual(users.map((user) => user.id), [1])
})

test('sql string as select', async ({assert}) => {
  const sql = `(
    select count(*) from comments
    where post_id = posts.id
  )::int as comment_count`

  const post = await Post.select('*', sql).find(1)
  assert.is(post.id, 1)
  assert.is(post.comment_count, 2)
})

test('sql with params as select', async ({assert}) => {
  const sql = `(select count(*) from comments
    where post_id = posts.id and user_id = ?)::int as comment_count`

  const post = await Post.select('*', [sql, 1]).find(1)
  assert.is(post.id, 1)
  assert.is(post.comment_count, 1)
})

test('count', async ({assert}) => {
  assert.is(await User.count(), 4)
})

test('count with where', async ({assert}) => {
  assert.is(await User.where('id < 3').count(), 2)
})

test('first page with more', async ({assert}) => {
  const users = await User.paginate(1, 2)
  assert.deepEqual(users.map((user) => user.id), [1, 2])
  assert.is(users.more, true)
})

test('second page without more', async ({assert}) => {
  const users = await User.paginate(2, 2)
  assert.deepEqual(users.map((user) => user.id), [3, 4])
  assert.is(users.more, false)
})

test('second page with less than count', async ({assert}) => {
  const users = await User.paginate(2, 3)
  assert.deepEqual(users.map((user) => user.id), [4])
  assert.is(users.more, false)
})

test('group by', async ({assert}) => {
  const users = await User.join('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  assert.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2]])
})

test('left join', async ({assert}) => {
  const users = await User
    .leftJoin('posts')
    .select('count(posts.id)::int as post_count')
    .groupBy('users.id')
    .order('id')
    .all()
  assert.deepEqual(users.map((user) => [user.id, user.post_count]), [[1, 2], [2, 2], [3, 0], [4, 0]])
})

test('search', async ({assert}) => {
  const posts = await Post.search('lorem').all()
  assert.is(posts.length, 1)
  assert.deepEqual(posts.map(({id}) => id), [1])
})

test('search with ampersand', async ({assert}) => {
  const posts = await Post.search('lorem & ipsum').all()
  assert.is(posts.length, 1)
  assert.deepEqual(posts.map(({id}) => id), [1])
})

test('search with quotes', async ({assert}) => {
  const posts = await Post.search('"lorem" " "ipsum"').all()
  assert.is(posts.length, 1)
  assert.deepEqual(posts.map(({id}) => id), [1])
})

test('exists', async ({assert}) => {
  assert.is((await User.where({id: 1}).exists()), true)
  assert.is((await User.where({id: 999}).exists()), false)
})
