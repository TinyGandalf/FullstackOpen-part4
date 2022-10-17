const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) {
    return response.status(400).end()
  }

  if (!request.user) return response.status(401).json({ error: 'invalid login' })

  const user = await User.findById(request.user.id)
  if (!user) return response.status(401).json({ error: 'invalid login' })

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes ?? 0,
    user: user.id
  })
  const result = await blog.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.user) return response.status(401).json({ error: 'invalid login' })

  const blog = await Blog.findById(request.params.id)
  if (blog?.user?.toString() !== request.user.id) return response.status(401).json({ error: 'invalid login' })

  await Blog.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const previousBlog = await Blog.findById(request.params.id)
  if (!previousBlog) return response.status(404).end()

  const newBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    {
      title: request.body.title ?? previousBlog.title,
      likes: request.body.likes ?? previousBlog.likes
    },
    { new: true }
  )

  response.status(200).json(newBlog)
})

module.exports = blogsRouter
