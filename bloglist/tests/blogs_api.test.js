const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Don Quixote : a systematic review',
    author: 'Cervantes',
    url: 'http://www.google.com',
    likes: 2
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
})

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the right amount of blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length)
})

afterAll(async () => {
  mongoose.connection.close()
})