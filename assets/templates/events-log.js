function renderUserHeading(username, avatarUrl) {
  return `<h1>
  <a target="_blank" name="${username}" href="https://github.com/${username}/">
    ${username}
    ${avatarUrl && renderImage(avatarUrl) || ''}
  </a>
</h1>
  `
}

function renderImage(imageSrc) {
  return `
<img src="${imageSrc}"/>
  `
}

function renderRepo(repo) {
  return `
<a target="_blank" href="https://github.com/${repo.name}/">${repo.name}</a>
  `
}

function renderCommit(repoName, commit) {
  return `
<li>
  <a target="_blank" href="https://github.com/${repoName}/commit/${commit.sha}/">
    <p>"${commit.message}" — ${commit.author.name}</p>
  </a>
</li>
  `
}

function renderPushEvent(event) {

  const commitsHTML = event.payload.commits.map(renderCommit.bind(null, event.repo.name)).join('')
  const eventHTML = `
<p>Pushed ${event.payload.distinct_size} commits ${moment(event.created_at).fromNow()}</p>
  `
  return `
<li class="list-group-item">
  ${eventHTML}
  <ul>${commitsHTML}</ul>
</li>
  `
}

function renderEvent(event) {
  const RENDER_BY_TYPE = {
    PushEvent: renderPushEvent
  }

  if (!RENDER_BY_TYPE[event.type]) {
    return ``
  }

  return RENDER_BY_TYPE[event.type](event)
}

function renderUserEventsLog({ username, events }) {

  if (!events.length) {
    return `<li class="list-group-item">${renderUserHeading(username)}</li>`
  }

  return `
<li class="list-group-item" >
  ${renderUserHeading(username, events[0].actor.avatar_url)}
  <ul class="events list-group list-group-flush">
    ${events.map(renderEvent).join('')}
  </ul>
</li>
  `
}

function renderEventsLog(users) {
  return `
<ul class="list-group">
  ${users.map(renderUserEventsLog).join('')}
</ul>
  `
}