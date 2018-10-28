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
  return get(
    octokit.activity.getEventsForUser,
    'activity.getEventsForUser',
    { username },
    assignEventsByDays,
  )
}

function getEventsForUsers({ users }) {
  return Promise.all(users.map(getEventsForUser))
}

// TODO: implement Forks mode
function getForksForRepo({ owner, repo }) {
  return get(
      octokit.repos.getForks,
      'repos.getForks',
      { owner, repo },
    )
}

function getTreeForRepo({ owner, repo }, tree_sha = 'master', recursive = 1) {
  return get(
    octokit.gitdata.getTree,
    'gitdata.getTree',
    { owner, repo, tree_sha, recursive },
  )
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

// TODO make wrapping HTML the same for both views
function makeForkHTML([ forks, tree ]) {
  return `
${renderClassChartForForks(forks)}
  `
}

function render(html) {
  const container = document.getElementById('container')
  container.innerHTML = html
}

function addEventsActions() {
  const chartSVGElement = document.getElementById('chart-svg')
  const chartInformationElement = document.getElementById('chart-information')

  chartSVGElement.addEventListener('mouseover', handleChartEnter.bind(chartSVGElement, chartInformationElement))
  chartSVGElement.addEventListener('mouseout', handleChartLeave.bind(chartSVGElement, chartInformationElement))
}

function addForkActions() {
  const chartElement = document.getElementById('class-chart')
  const chartDiffViewerElement = document.getElementById('class-chart--diff-viewer')

  chartElement.addEventListener('click', handleForkClick.bind(chartElement, chartDiffViewerElement))
}

function getAndRenderRepo(settings) {
  return Promise.all([
      getForksForRepo(settings),
      getTreeForRepo(settings),
    ])
    .then(filterReposForUsers.bind(null, settings))
    .then(assignCompareLinksForForks.bind(null, settings))
    .then(makeForkHTML)
    .then(render)
    .then(addForkActions)
}

function getAndRenderUsers(settings) {
  return getEventsForUsers(settings)
    .then(filterForExisting)
    .then(sortUsers)
    .then(makeHTML)
    .then(render)
    .then(addEventsActions)
}

function handleBySettings(settings) {
  if (settings.mode === 'repo') {
    return getAndRenderRepo(settings)
  }

  return getAndRenderUsers(settings)
}

function update() {
  getSettings()
    .then(authenticate)
    .then(handleBySettings)
}

let frame = 0
const FRAMERATE = 30 * 60 * 1000 // when polling is activated, polls twice per hour

function pollForChanges(timestamp) {
  // TODO: polling should indicate when updates have been received.
  if (timestamp / FRAMERATE > frame) {
    frame = frame + 1
    update()
  }
  window.requestAnimationFrame(pollForChanges)
}

update()
// window.requestAnimationFrame(pollForChanges)
