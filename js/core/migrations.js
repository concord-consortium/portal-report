import semver from 'semver'

function notify(message) {
  console && console.log(message)
}

function setVersionNumber(dataMap, versionString) {
  dataMap.reportVersion = versionString
}

function addStudentNames(dataMap) {
  notify("splitting student names (first,last)")
  for(var student of dataMap.class.students) {
    var names = student.name.split(/\s+/)
    student.firstName = names[0]
    student.lastName = names[1]
  }
}


function addFeedback(dataMap) {
  notify("adding Feedback to questions")
  const handleQuestion = function(ent) {
    for(var child of ent.children || []) {
      handleQuestion(child)
    }
    // These will be read-only values, because the portal wont know how to set them at this version number.
    for(var answer of ent.answers || []) {
      answer.feedbacks = [{
        "score": null,
        "feedback": null,
        "has_been_reviewed": false
      }]
    }
  }
  handleQuestion(dataMap.report)
}

function addActivityFeedback(dataMap) {
  console.log("TODO: addActivityFeedback")
}

function addPageUrl(dataMap) {
  const pageType = "Page"
  const report = dataMap.report
  const defaultUrl = null
  const processPage = function (item) {
    if (!item.url) {
      item.url = defaultUrl
    }
  }
  const processChildren = function (item) {
    if (item.children) {
      item.children.forEach((child) => processChildren(child))
    }
    if (item.type === pageType) {
      processPage(item)
    }
  }
  processChildren(report)
}

const migrations = [
  { version: '1.0.0',
    migrations:[]
  },
  {
    version: '1.0.1',
    migrations:[
      addStudentNames,
      addFeedback
    ]
  },
  {
    version: '1.0.2',
    migrations:[
      addPageUrl
    ]
  },
  {
    version: '1.0.3',
    migrations:[
      addActivityFeedback
    ]
  }
]

function runMigration(dataMap, migration) {
  notify(`migrating to ${migration.version}`)
  setVersionNumber(dataMap, migration.version)
  for(migration of migration.migrations) {
    migration(dataMap)
  }
  return dataMap
}

function skipMigration(migration) {
  notify(`skipping migration: ${migration.version}`)
}

export default function migrate(dataMap) {
  dataMap.reportVersion = dataMap.reportVersion ? dataMap.reportVersion : "0.0.0"

  for(var m of migrations) {
    if (semver.gte(dataMap.reportVersion, m.version)) {
      skipMigration(m)
    }
    else {
      runMigration(dataMap, m)
    }
  }
  return dataMap
}

