function renderUserChartRowForFork(fork) {
  return `
<li data-diff-link="${fork.compareLink}.diff" class="list-group-item">
  <a href="${fork.compareLink}" target="class-chart--window">
    <img src="${fork.owner.avatar_url}" width="${BASE_SIZE}" height="${BASE_SIZE}"/>
  </a>
  Diff
</li>
  `
}

function updateDiff(diffViewerElement, diffLink) {
  // TODO -- this isn't gonna last...
  return fetch(`//cors-anywhere.herokuapp.com/${diffLink}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept':	'*/*',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
    .then(function (response) {
      return response.text()
    })
    .then(function (diff) {
      const diffHTML = Diff2Html.getPrettyHtml(
        diff,
        {
          inputFormat: 'diff',
          showFiles: true,
          matching: 'lines',
          outputFormat: 'side-by-side',
        },
      )

      diffViewerElement.innerHTML = diffHTML
    })
}

function handleForkClick(diffViewerElement, clickEvent) {
  if (!clickEvent.target.dataset.diffLink) {
    return
  }

  const diffLink = clickEvent.target.dataset.diffLink
  Array.prototype.forEach.call(
    this.querySelectorAll(`.${ACTIVE_CLASS_NAME}`),
    removeClass.bind(null, ACTIVE_CLASS_NAME)
  )

  clickEvent.target.classList.add(ACTIVE_CLASS_NAME)

  updateDiff(diffViewerElement, diffLink)  
}

function renderClassChartForForks(forks) {

  return `
<div id="class-chart" class="row">
  <ul class="class-chart--roster col-1 list-group fixed-top">
    ${forks.map(renderUserChartRowForFork).join('')}
  </ul>
  <div id="class-chart--diff-viewer" class="col-11 ml-auto"></div>
</div>
  `

}