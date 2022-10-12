const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of initialBlogs) {
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
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

test('the blogs returned contain their id as "id"', async () => {
  const response = await api.get('/api/blogs')

  for (const blog of response.body) {
    expect(blog.id).toBeDefined()
  }
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "React anti-patterns",
    author: "Cichael Mhan",
    url: "https://angularjs.com/",
    likes: 70
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogsAtEnd = response.body

  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
  const titles = blogsAtEnd.map(n => n.title)
  expect(titles).toContain(
    'React anti-patterns'
  )
})

test('all blogs should have a likes field', async () => {
  const response = await api.get('/api/blogs')
  const blogsAtEnd = response.body

  const likeFields = blogsAtEnd.map(n => n.likes)
  expect(likeFields).toBeDefined()
  expect(likeFields).not.toBeNaN()
})

test('if the likes field is ommited it defaults to 0', async () => {
  const newBlog = {
    title: "React anti-patterns",
    author: "Cichael Mhan",
    url: "https://angularjs.com/"
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogsAtEnd = response.body

  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

  const blog = blogsAtEnd.filter(blog => blog.title === newBlog.title)
  expect(blog[0]).toBeDefined()
  expect(blog[0].likes).toEqual(0)
})

test('if the title field is ommited the api returns a 400 error', async () => {
  const newBlog = {
    //title: "React anti-patterns",
    author: "Cichael Mhan",
    url: "https://angularjs.com/",
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('if the url field is ommited the api returns a 400 error', async () => {
  const newBlog = {
    title: "React anti-patterns",
    author: "Cichael Mhan",
    //url: "https://angularjs.com/",
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

afterAll(async () => {
  mongoose.connection.close()
})