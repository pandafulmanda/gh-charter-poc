// TODO make these caching hooks endpoint agnostic
function getRequestOptionsForUser(username, cachedUser) {
  let requestOptions = {
    username,
    per_page: 100,
    page: 1,
  }

  // TODO avoiding mutation here will probably matter later.
  if (cachedUser && cachedUser.headers) {
    requestOptions.headers = {
      'if-none-match': cachedUser.headers.etag,
    }
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
    console.warn(error)
    return
  }

  // TODO should also handle 404 somehow when search params should be adjusted
  return cachedUser
}