const getUser = req => {
  return req.user || null
}

const isAuthenticated = req => {
  return req.isAuthenticated()
}

module.exports = { getUser, isAuthenticated }
