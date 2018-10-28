// TODO move these to a constants file.
const BASE_SIZE = 30
const ACTIVE_CLASS_NAME = 'active'

function renderDay({ domain, range }, eventsByDay, day, dayIndex) {
  const eventsRatioLogScaled = (
    (eventsByDay && Math.log(eventsByDay.sum + 1)) || 0) /
    (Math.log(range.max + 1) - Math.log(range.min + 1)
  )

  return `
<rect
  transform="translate(${dayIndex * BASE_SIZE}, 0)"
  width="${BASE_SIZE}"
  height="${BASE_SIZE}"
  fill="green"
  fill-opacity="${eventsRatioLogScaled}"
  data-day="${day}"
  data-events-ratio="${eventsRatioLogScaled}"
></rect>
  `
}

function renderUserChart({ domain, range }, user) {

  if (!user.data.length) {
    return `<rect width="${BASE_SIZE}" height="${BASE_SIZE}" fill="white" stroke="black"></rect>`
  }

  return `
<image xlink:href="${user.data[0].actor.avatar_url}" width="${BASE_SIZE}" height="${BASE_SIZE}"/>
  `
}

// TODO Translate to HTML, don't really need to use svgs.
// TODO Separate out user chart rendering from data rendering
function renderUserChartRow({ domain, range }, user, index) {
  return `
<g transform="translate(0, ${index * BASE_SIZE})" data-username="${user.username}">
  <a class="link" target="_blank" xlink:href="https://github.com/${user.username}/">
    ${renderUserChart({ domain, range }, user)}
  </a>
  <g transform="translate(${BASE_SIZE}, 0)">
    ${domain.map(function(day, dayIndex) {
      return renderDay({ domain, range }, user.eventsByDays[day], day, dayIndex)
    }).join('')}
  </g>
</g>
  `
}

function renderUserEventsForDay(day, user) {
  return user.eventsByDays[day].events.map(renderEvent).join('')
}

function removeClass(className, element) {
  element.classList.remove(className)
}

function handleChartEnter(informationElement, mouseoverEvent) {
  if (!mouseoverEvent.target.dataset.day) {
    return
  }

  const dayRect = mouseoverEvent.target
  const userRow = dayRect.parentNode.parentNode

  const day = dayRect.dataset.day
  const username = userRow.dataset.username

  this.dataset.activeDay = day
  this.dataset.activeUserName = username

  Array.prototype.forEach.call(
    this.querySelectorAll(`.${ACTIVE_CLASS_NAME}`),
    removeClass.bind(null, ACTIVE_CLASS_NAME)
  )

  dayRect.classList.add(ACTIVE_CLASS_NAME)
  userRow.classList.add(ACTIVE_CLASS_NAME)

  informationElement.style.top = `${mouseoverEvent.clientY}px`
  informationElement.style.left = `${mouseoverEvent.clientX}px`
  
  if (mouseoverEvent.target.dataset.eventsRatio === "0") {
    informationElement.innerHTML = `
<li class="list-group-item">
  No events for <strong>${username}</strong> on ${day}.
</li>
    `
    return
  }
  getFromStorage('activity.getEventsForUser', { username })
    .then(renderUserEventsForDay.bind(null, day))
    .then(function (listHTML) {
      informationElement.innerHTML = listHTML
    })
    .catch(function (error) {
      informationElement.innerHTML = ''
      console.warn(`No events for ${username} on ${day}.`, error)
    })
}

function handleChartLeave(informationElement, mouseoutEvent) {

  this.dataset.activeUserName = null
  this.dataset.activeDay = null

  Array.prototype.forEach.call(
    this.querySelectorAll(`.${ACTIVE_CLASS_NAME}`),
    removeClass.bind(null, ACTIVE_CLASS_NAME)
  )
}

// TODO Translate to HTML, don't really need to use svgs.
// TODO Separate out user chart rendering from data rendering
function renderClassChart(users) {
  let domain = getEventsDaysDomain(users)
  let range = getMinAndMax(users)

  return `
<svg
  id="chart-svg"
  class="list-group"
  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  height="${users.length * BASE_SIZE}"
  width="${domain.length * BASE_SIZE}">
  ${users.map(renderUserChartRow.bind(null, { domain, range })).join('')}
</svg>
<ul id="chart-information" class="list-group"></ul>
  `
}