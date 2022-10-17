const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const { initialUsers } = require('./test_helpers')

describe('some users already on the db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(initialUsers)
  })

  test('users are returned as JSON', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('the right amount of users are returned', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const users = response.body
    expect(users).toBeDefined()
    expect(users).toHaveLength(initialUsers.length)
  })
})

describe('creating users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('valid user returns code 201 and the user data', async () => {
    const userData = {
      username: 'MrSir',
      name: 'Mister Sir',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    const { id, username, name, token } = response.body
    expect(id).toBeDefined()
    expect(username).toBe(userData.username)
    expect(name).toBe(userData.name)
  })
  
  test('valid user (no name) returns code 201 and the user data (empty name)', async () => {
    const userData = {
      username: 'MrSir',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    const { id, username, name, token } = response.body
    expect(id).toBeDefined()
    expect(username).toBe(userData.username)
    expect(name).toBe('')
  })
  
  test('invalid user (no username) returns code 400 and a json body for the error', async () => {
    const userData = {
      name: 'Mister Sir',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    expect(response.body.error).toBe('no username provided')
  })
  
  test('invalid user (no password) returns code 400 and a json body for the error', async () => {
    const userData = {
      username: 'MrSir',
      name: 'Mister Sir'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    expect(response.body.error).toBe('no password provided')
  })

  test('can\'t create a user with an already used username', async () => {
    const userData = {
      username: 'MrSir',
      name: 'Mister Sir',
      password: 'shakenmartini'
    }
  
    await api
      .post('/api/users')
      .send(userData)

    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    expect(response.body.error).toBe('a user with that username already exists')
  })

  test('username should have a length >= 3 characters', async () => {
    const userData = {
      username: 'Do',
      name: 'Mister Sir',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    expect(response.body.error).toBe('username should be at least 3 characters long')
  })

  test('password should have a length >= 3 characters', async () => {
    const userData = {
      username: 'MrSr',
      name: 'Mister Sir',
      password: 'sh'
    }
  
    const response = await api
      .post('/api/users')
      .send(userData)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    expect(response.body.error).toBe('password should be at least 3 characters long')
  })
})

describe('user login', () => {
  beforeAll(async () => {
    const userData = {
      username: 'LoginSir',
      name: 'Login Sir',
      password: 'shakenmartini'
    }

    await api
      .post('/api/users')
      .send(userData)
  })

  test('valid login returns status 200, username and JWT', async () => {
    const loginData = {
      username: 'LoginSir',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users/login')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    const { id, username, token } = response.body
    expect(id).toBeDefined()
    expect(username).toBe(loginData.username)
    expect(token).toBeDefined()
  })

  test('invalid login (user not found) returns status 401 and error message', async () => {
    const loginData = {
      username: '',
      password: 'shakenmartini'
    }
  
    const response = await api
      .post('/api/users/login')
      .send(loginData)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    const { error } = response.body
    expect(error).toBe('invalid username or password')
  })

  test('invalid login (password incorrect) returns status 401 and error message', async () => {
    const loginData = {
      username: 'LoginSir',
      password: 'stirredmartini'
    }
  
    const response = await api
      .post('/api/users/login')
      .send(loginData)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toBeDefined()
    const { error } = response.body
    expect(error).toBe('invalid username or password')
  })
})

afterAll(async () => {
  mongoose.connection.close()
})