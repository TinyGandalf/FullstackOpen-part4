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
    test('deleting an existing blog returns code 204 and the blog is gone', async () => { 
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      const blogToDelete = blogsBefore[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      response = await api.get('/api/blogs')
      const blogsAfter = response.body
      
      expect(blogsAfter.length).toEqual(blogsBefore.length - 1)

      const blogAfter = blogsAfter.find(blog => blog.id === blogToDelete.id)
      expect(blogAfter).toBeUndefined()
    })

    test('deleting an non existing blog returns code 204 and no changes are made', async () => { 
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      let id = '63474a7f4a3a2ca8186626f7'
      while (blogsBefore.find(blog => blog.id === id)) {
        randomNumber = Math.floor(Math.random() * 10)
        id = `${randomNumber}474a7f4a3a2ca8186626f7`
      }

      await api
        .delete(`/api/blogs/${id}`)
        .expect(204)

      response = await api.get('/api/blogs')
      const blogsAfter = response.body

      expect(blogsAfter.length).toEqual(blogsBefore.length)
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
      let response = await api.get('/api/blogs')
      const blogsBefore = response.body

      let id = '63474a7f4a3a2ca8186626f7'
      while (blogsBefore.find(blog => blog.id === id)) {
        randomNumber = Math.floor(Math.random() * 10)
        id = `${randomNumber}474a7f4a3a2ca8186626f7`
      }

      await api
        .put(`/api/blogs/${id}`)
        .expect(404)
    })
  })
})

afterAll(async () => {
  mongoose.connection.close()
})