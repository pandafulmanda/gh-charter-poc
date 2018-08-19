function getRequestOptionsForUser(username, cachedUser) {
  let requestOptions = {
    username,
    per_page: 100,
    page: 1,
  }
  if (cachedUser && cachedUser.headers) {
    requestOptions = Object.assign({
      headers: {
        'if-none-match': cachedUser.headers.etag,
      },
    }, requestOptions)
  }

  return requestOptions
}

function handleAPIResponse(username, cachedUser, { data, headers }) {
  let user = {
    username,
    events: data,
    headers,
  }

  user = Object.assign(groupEventsByDays(data), user)

  localforage.setItem(username, user)

  return user
}

function returnFromCacheOrError(username, cachedUser, error) {
  if (error.message !== 'Not modified') {
    return error
  }
  return cachedUser
}