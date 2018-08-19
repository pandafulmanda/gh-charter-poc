const DATE_FORMAT = 'YYYYMMDD'

function filterForPushEvents(events) {
  return events.filter(function(event) { return event.type === 'PushEvent'})
}

function getComparisonValue(user) {
  if (filterForPushEvents(user.events).length) {
    return moment(filterForPushEvents(user.events)[0].created_at).valueOf()
  }

  return -1
}

function byEventsStaleness(userA, userB) {
  return getComparisonValue(userA) - getComparisonValue(userB)
}


function groupEventsByDays(events) {
  let eventsByDays = {}
  let min = 0
  let max = 0

  filterForPushEvents(events).forEach(function(event) {
    eventsByDays[moment(event.created_at).format(DATE_FORMAT)] = eventsByDays[moment(event.created_at).format(DATE_FORMAT)] || {events: []}
    eventsByDays[moment(event.created_at).format(DATE_FORMAT)].events.push(event)
    eventsByDays[moment(event.created_at).format(DATE_FORMAT)].sum = sumSizes(eventsByDays[moment(event.created_at).format(DATE_FORMAT)].events)

    if (eventsByDays[moment(event.created_at).format(DATE_FORMAT)].sum > max) {
      max = eventsByDays[moment(event.created_at).format(DATE_FORMAT)].sum
    }
  })

  return { eventsByDays, min, max }
}
