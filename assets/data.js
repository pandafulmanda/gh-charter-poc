const DATE_FORMAT = 'YYYYMMDD'

function isTruthy(item) {
  return item
}

function convertStringToNumber(string) {
  return string * 1
}

function isEventType(type, event) {
  return event.type === type
}

function isPushEvent(event) {
  return isEventType.call(null, 'PushEvent', event)
}

function filterForPushEvents(events = []) {
  return events.filter(isPushEvent)
}

function getComparisonValue(user) {
  let pushEventsOnly = user.events.filter(isPushEvent)

  if (pushEventsOnly.length) {
    return moment(pushEventsOnly[0].created_at).valueOf()
  }

  return -1
}

function byEventsStaleness(userA, userB) {
  return getComparisonValue(userA) - getComparisonValue(userB)
}

function keyEventByDay(result, event) {
  let day = moment(event.created_at).format(DATE_FORMAT)

  result[day] = result[day] || { events: [] }
  result[day].events.push(event)
  result[day].sum = sumSizes(result[day].events)

  if (result[day].sum > max) {
    max = result[day].sum
  }
}

function groupEventsByDays(events) {
  let min = 0
  let max = 0

  let eventsByDays = events
                      .filter(isPushEvent)
                      .reduce(keyEventByDay, {})

  return { eventsByDays, min, max }
}
