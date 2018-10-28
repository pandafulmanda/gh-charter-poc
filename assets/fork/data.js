function isForkOfUsers(users, fork) {
  return users.includes(fork.owner.login)
}

function filterReposForUsers({ users }, [ forks, tree ]) {
  // TODO pull out passing in just the data into a separate function
  const forksOfUsers = forks.data.filter(isForkOfUsers.bind(null, users))

  return [ forksOfUsers, tree.data ]
}

function getCompareLinkForFork({ owner, repo }, fork) {
  return `https://github.com/${owner}/${repo}/compare/master...${fork.owner.login}:master`
}

function assignCompareLinkForFork({ owner, repo }, fork) {
  const compareLink = getCompareLinkForFork({ owner, repo }, fork)

  return Object.assign(
    { compareLink },
    fork,
  )
}

function assignCompareLinksForForks({ owner, repo }, [ forks, tree ]) {
  let forksWithCompareLinks = forks.map(assignCompareLinkForFork.bind(null, { owner, repo }))

  return [ forksWithCompareLinks, tree ]
}