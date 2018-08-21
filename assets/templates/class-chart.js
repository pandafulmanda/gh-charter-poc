const BASE_SIZE = 30

function sumWithDistinctSize(sum, event) {
  return sum + event.payload.distinct_size
}

function sumSizes(events) {
  return events.reduce(sumWithDistinctSize, 0)
}

function getMinAndMax(users) {
  // TODO give up and just use lodash
  let mins = users.map(function(user) { return user.min })
  let maxes = users.map(function(user) { return user.max })

  return {
    min: Math.min(...mins),
    max: Math.max(...maxes),
  }
}

function gatherEventDays(result, { eventsByDays }) {
  return result.concat(Object.keys(eventsByDays))
}

function getEventsDaysDomain(users) {

  const allDays = users
                    .reduce(gatherEventDays, [])
                    .map(convertStringToNumber)

  const minDay = Math.min(...allDays)
  const maxDay = Math.max(...allDays)

  const startMoment = moment(minDay, DATE_FORMAT).startOf('day')
  const endMoment = moment(maxDay, DATE_FORMAT).endOf('day')

  const viewToMoment = startMoment // endMoment.clone().subtract(40, 'days')

  let dayMoment = endMoment.clone()
  let days = []

  while (dayMoment.isSameOrAfter(viewToMoment)) {
    days.push(dayMoment.format(DATE_FORMAT))
    dayMoment.subtract(1, 'day')
  }

  return days
}

function renderDay({ domain, range }, eventsByDay, day, dayIndex) {
  return `
<rect
  transform="translate(${dayIndex * BASE_SIZE}, 0)"
  width="${BASE_SIZE}"
  height="${BASE_SIZE}"
  fill="green"
  fill-opacity="${
    ((eventsByDay && Math.log(eventsByDay.sum + 1)) || 0) /
    (Math.log(range.max + 1) - Math.log(range.min + 1))
  }"
  data-day="${day}"
></rect>
  `
}

function renderUserChart({ domain, range }, user) {

  if (!user.events.length) {
    return `<rect width="${BASE_SIZE}" height="${BASE_SIZE}" fill="white" stroke="black"></rect>`
  }

  return `
<image xlink:href="${user.events[0].actor.avatar_url}" width="${BASE_SIZE}" height="${BASE_SIZE}"/>
  `
}

function renderUserChartRow({ domain, range }, user, index) {
  return `
<g transform="translate(0, ${index * BASE_SIZE})">
  <a class="link" target="_blank" xlink:href="https://github.com/${user.username}/">
    ${renderUserChart({ domain, range }, user)}
  </a>
  <g transform="translate(${BASE_SIZE}, 0)" data-username="${user.username}">
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

function handleChartEvents(informationElement, mouseoverEvent) {
  if (!mouseoverEvent.target.dataset.day) {
    return
  }
  const dayRect = mouseoverEvent.target
  const day = dayRect.dataset.day
  const username = dayRect.parentNode.dataset.username

  informationElement.style.top = `${mouseoverEvent.clientY}px`
  informationElement.style.left = `${mouseoverEvent.clientX}px`

  localforage.getItem(username)
    .then(renderUserEventsForDay.bind(null, day))
    .then(function (listHTML) {
      informationElement.innerHTML = listHTML
    })
    .catch(function (error) {
      informationElement.innerHTML = ''
      console.warn(`No events for ${username} on ${day}.`, error)
    })
}

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