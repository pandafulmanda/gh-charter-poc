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
    events: data,
    headers,
  }, options)

  // abstract this data transformation out
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

function get(apiFunction, topic, options, transformItem) {

  let key = `${topic}=${JSON.stringify(options)}`

  return localforage.getItem(key)
  .then(function (cachedItem) {
      let args = [key, options, cachedItem, transformItem]

      let requestOptions = getRequestOptionsForCached.apply(null, args)
      return apiFunction(requestOptions)
        .then(handleAPIResponse.bind(null, ...args))
        .catch(returnFromCacheOrError.bind(null, ...args))
    })
}
