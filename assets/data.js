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

  return result
}

function groupEventsByDays(events) {
  let min = 0

  let eventsByDays = events
                      .filter(isPushEvent)
                      .reduce(keyEventByDay, {})

  let sums = Object.values(eventsByDays).map(function(event) { return event.sum })

  return { eventsByDays, min, max: Math.max(...sums) }
}

function assignEventsByDays(user, data) {
  return Object.assign(groupEventsByDays(data), user)
}

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
