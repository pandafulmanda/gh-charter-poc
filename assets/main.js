const octokit = Octokit()

function getSettings() {
  const searchParameters = new URLSearchParams(location.search.replace('?', ''))

  if (searchParameters.has('settings')) {
    return getSettingsFromURL(searchParameters.get('settings'))
  }

  try {
    return Promise.resolve(parseSettingsFromSearchParameters(searchParameters))
  } catch (error) {
    return getSettingsFromURL()
  }

}

function authenticate(settings) {
  if (settings.token) {
    octokit.authenticate({type: 'token', token: settings.token })
  }

  return settings
}

function getEventsForUser(username) {

  return localforage.getItem(username)
    .then(function (cachedUser) {

      let requestOptions = getRequestOptionsForUser(username, cachedUser)

      return octokit.activity
        .getEventsForUser(requestOptions)
        .then(handleAPIResponse.bind(null, username, cachedUser))
        .catch(returnFromCacheOrError.bind(null, username, cachedUser))
    })
}

function getEventsForUsers({ users }) {
  return Promise.all(users.map(getEventsForUser))
}

function filterForExisting(users) {
  return users.filter(isTruthy)
}

function sortUsers(users) {
  return users.sort(byEventsStaleness)
}

function makeHTML(users) {
  return `
<div class="row" id="chart">
  <div class="col">
    ${renderClassChart(users)}
  </div>
</div>
`
}

function render(html) {
  const container = document.getElementById('container')
  container.innerHTML = html

  const chartSVGElement = document.getElementById('chart-svg')
  const chartInformationElement = document.getElementById('chart-information')

  chartSVGElement.addEventListener('mouseover', handleChartEvents.bind(chartSVGElement, chartInformationElement))
}

getSettings()
  .then(authenticate)
  .then(getEventsForUsers)
  .then(filterForExisting)
  .then(sortUsers)
  .then(makeHTML)
  .then(render)
