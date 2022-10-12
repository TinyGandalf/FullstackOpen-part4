const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes ?? 0
  })
  const result = await blog.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
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
