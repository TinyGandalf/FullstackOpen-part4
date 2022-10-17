const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, nonExistingBlogId } = require('./test_helpers')

let testUser, testUserId, testToken;

beforeAll(async () => {
  await User.findOneAndRemove({ username: 'MrBlog' })
  testUser = {
    username: 'MrBlog',
    password: 'shakenmartini'
  }

  let response = await api
    .post('/api/users')
    .send(testUser)
    .expect(201)

  testUserId = response.body.id

  response = await api
    .post('/api/users/login')
    .send(testUser)
    .expect(200)

  testToken = response.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

describe('when some blogs are already present', () => { 
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

  test('all blogs should have a likes field', async () => {
    const response = await api.get('/api/blogs')
    const blogsAtEnd = response.body

    const likeFields = blogsAtEnd.map(n => n.likes)
    expect(likeFields).toBeDefined()
    expect(likeFields).not.toBeNaN()
  })

  describe('adding blogs', () => { 
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
        .set({ Authorization: `Bearer ${testToken}` })
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
  
    test('if the likes field is ommited it defaults to 0', async () => {
      const newBlog = {
        title: "React anti-patterns",
        author: "Cichael Mhan",
        url: "https://angularjs.com/"
      }
  
      await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${testToken}` })
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
  })

  describe('deleting blogs', () => {
    test('deleting a user\'s own blog returns code 204', async () => { 
      const blogToDelete = {
        title: "React anti-patterns",
        author: "Cichael Mhan",
        url: "https://angularjs.com/",
        likes: 70,
        user: testUserId
      }
  
      const response = await api
        .post('/api/blogs')
        .send(blogToDelete)
        .set({ Authorization: `Bearer ${testToken}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      await api
        .delete(`/api/blogs/${response.body.id}`)
        .set({ Authorization: `Bearer ${testToken}` })
        .expect(204)
    })

    test('deleting another user\'s blog returns code 401', async () => { 
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      const blogToDelete = blogsBefore[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${testToken}` })
        .expect(401)
    })

    test('deleting a non existing blog without authentication blog returns code 401', async () => { 
      let id = await nonExistingBlogId()

      await api
        .delete(`/api/blogs/${id}`)
        .expect(401)
    })

    test('deleting a non existing blog with authentication returns code 401', async () => { 
      let id = await nonExistingBlogId()

      await api
        .delete(`/api/blogs/${id}`)
        .set({ Authorization: `Bearer ${testToken}` })
        .expect(401)
    })
  })

  describe('updating blogs', () => { 
    test('updating an existing blog title field returns code 200 and the blog is updated', async () => { 
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      const blogToUpdate = blogsBefore[0]
      const updatedBlog = {
        ...blogToUpdate,
        title: 'Something funny'
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      response = await api.get('/api/blogs')
      const blogsAfter = response.body
      
      expect(blogsAfter.length).toEqual(blogsBefore.length)

      const blogAfter = blogsAfter.find(blog => blog.id === blogToUpdate.id)
      expect(blogAfter).toStrictEqual(updatedBlog)
    })

    test('updating an existing blog likes field returns code 200 and the blog is updated', async () => { 
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      const blogToUpdate = blogsBefore[0]
      const updatedBlog = {
        ...blogToUpdate,
        likes: 1056
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      response = await api.get('/api/blogs')
      const blogsAfter = response.body
      
      expect(blogsAfter.length).toEqual(blogsBefore.length)

      const blogAfter = blogsAfter.find(blog => blog.id === blogToUpdate.id)
      expect(blogAfter).toStrictEqual(updatedBlog)
    })

    test('updating an non existing blog returns code 404', async () => { 
      let id = await nonExistingBlogId()

      await api
        .put(`/api/blogs/${id}`)
        .expect(404)
    })
  })
})

afterAll(async () => {
  mongoose.connection.close()
})