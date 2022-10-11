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

const mostBlogs = (blogs) => {
  if (!blogs?.length) return {}

  const blogsReducer = (authors, blog) => {
    if (!authors[blog.author]) authors[blog.author] = 0
    authors[blog.author]++

    return authors
  }

  const authorsReducer = (topAuthor, [ author, blogs ]) => {
    return topAuthor.blogs > blogs
      ? topAuthor
      : { author, blogs }
  }

  const authors = blogs.reduce(blogsReducer, [])

  return Object.entries(authors).reduce(authorsReducer, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}