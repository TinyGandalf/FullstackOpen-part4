const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

const userExtractor = (request, response, next) => {
  const token = getTokenFrom(request)
  if (!token) return next()

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) return next()

  request.user = {
    id: decodedToken.id,
    username: decodedToken.username
  }

  next()
}

module.exports = {
  userExtractor
}