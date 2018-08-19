function responseToJSON(response) {
  return response.json()
}

function getSettingsFromURL(settingsURL = './assets/settings.json') {
  return fetch(settingsURL)
    .then(responseToJSON)
}

function parseSettingsFromSearchParameters(searchParameters) {
  return {
    users: searchParameters.get('users').split(','),
    token: searchParameters.get('token'),
  }
}