function responseToJSON(response) {
  return response.json()
}

function getSettingsFromURL(settingsURL = './assets/settings.json') {
  return fetch(settingsURL)
    .then(responseToJSON)
}

function parseSettingsFromSearchParameters(searchParameters) {
  return {
    mode: searchParameters.get('mode'),
    repo: searchParameters.get('repo'),
    owner: searchParameters.get('owner'),
    users: (searchParameters.get('users') || '').split(','),
    token: searchParameters.get('token'),
  }
}