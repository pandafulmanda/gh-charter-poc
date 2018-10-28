function getRequestOptionsForCached(key, options, cachedItem) {
  let requestOptions = Object.assign({
    per_page: 100,
    page: 1,
  }, options)

  // TODO avoiding mutation here will probably matter later.
  if (cachedItem && cachedItem.headers) {
    requestOptions.headers = {
      'if-none-match': cachedItem.headers.etag,
    }
  }

  return requestOptions
}

function handleAPIResponse(key, options, cachedItem, transformItem, { data, headers }) {
  let item = Object.assign({
    data,
    headers,
  }, options)

  if (typeof transformItem === 'function') {
    item = transformItem(item, data)
  }

  localforage.setItem(key, item)

  return item
}

function returnFromCacheOrError(key, options, cachedItem, transformItem, error) {
  if (error.message !== 'Not modified') {
    console.warn(error)
    return
  }

  // TODO should also handle 404 somehow when search params should be adjusted
  return cachedItem
}

function makeKey(topic, options) {
  return `${topic}=${JSON.stringify(options)}`
}

function getFromStorage(topic, options) {
  let key = makeKey(topic, options)
  return localforage.getItem(key)
}

function get(apiFunction, topic, options, transformItem) {

  return getFromStorage(topic, options)
    .then(function (cachedItem) {
      let key = makeKey(topic, options)
      let args = [key, options, cachedItem, transformItem]

      let requestOptions = getRequestOptionsForCached.apply(null, args)
      return apiFunction(requestOptions)
        .then(handleAPIResponse.bind(null, ...args))
        .catch(returnFromCacheOrError.bind(null, ...args))
    })
}
