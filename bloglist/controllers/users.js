const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  response.send(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username) return response.status(400).json({ error: 'no username provided' })
  if (!password) return response.status(400).json({ error: 'no password provided' })

  const userObject = new User({
    username,
    name: name ?? '',
    passwordHash: await bcrypt.hash(password, 10)
  })
  const savedUser = await userObject.save()

  response.status(201).send(savedUser)
})

module.exports = usersRouter