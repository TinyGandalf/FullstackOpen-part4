const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
  
  if (username.length <= 3) return response.status(400).json({ error: 'username should be at least 3 characters long' })
  if (password.length <= 3) return response.status(400).json({ error: 'password should be at least 3 characters long' })
  
  const existingUser = await User.findOne({ username })
  if (existingUser) return response.status(400).json({ error: 'a user with that username already exists' })
  
  const userObject = new User({
    username,
    name: name ?? '',
    passwordHash: await bcrypt.hash(password, 10)
  })
  const savedUser = await userObject.save()

  response.status(201).send(savedUser)
})

usersRouter.post('/login', async (request, response) => {
  const { username, password } = request.body

  if (username?.length <= 3 || password?.length <= 3) {
    return response.status(401).json({ error: 'invalid username or password' })
  }
  
  const user = await User.findOne({ username })
  const loginCorrect = 
    user
    && await bcrypt.compare(password, user.passwordHash)
  
  if (!loginCorrect) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, id: user.id, username: user.username })
})

module.exports = usersRouter