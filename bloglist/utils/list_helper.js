const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs?.length
    ? blogs.reduce((sum, blog) => sum + blog.likes, 0)
    : 0
}

const favoriteBlog = (blogs) => {
  if (!blogs?.length) return {}

  const { title, author, likes } = blogs.reduce(
    (topBlog, blog) => topBlog.likes > blog.likes ? topBlog : blog
  )

  return { title, author, likes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}