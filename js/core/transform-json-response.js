import { normalize, schema } from 'normalizr'
import humps from 'humps'
import migrate from './migrations'
import queryString from 'query-string'

const DEFAULT_REPORT_FOR = 'class'
// Transforms deeply nested structure of report:
// {
//  "report": {
//  "id": 18,
//  "type": "Investigation",
//  "name": "Test Sequence",
//  "children": [
//  {
//      "id": 29,
//      "type" "Activity",
//      "children": [
//      {
//        "id": 101,
//        "type": "Section"
//        (...)
// into normalized form where objects are grouped by ID.
// See: https://github.com/gaearon/normalizr
export default function transformJSONResponse (json) {
  const camelizedJson = humps.camelizeKeys(json,
    // don't convert keys that are only upercase letters and numbers.
    // This is useful for rubric keys for example "C2" and "R1"
    (key, convert) => /^[A-Z0-9_]+$/.test(key) ? key : convert(key))

  const student = new schema.Entity('students')
  const investigation = new schema.Entity('investigations')
  const activity = new schema.Entity('activities')
  const section = new schema.Entity('sections')
  const page = new schema.Entity('pages')
  const question = new schema.Entity('questions', {}, {
    idAttribute: (q) => q.key
  })
  // Answers don't have unique ID so generate it. Embeddable key + student ID works.
  const answer = new schema.Entity('answers', {}, {
    idAttribute: (a) => `${a.embeddableKey}-${a.studentId}`
  })
  const feedback = new schema.Entity('feedbacks', {}, {
    idAttribute: (a) => a.answerKey
  })

  const activityFeedback = new schema.Entity('activityFeedbacks', {}, {
    idAttribute: (value, parent) => `${parent.id}-${value.studentId}`
  })

  investigation.define({
    children: [ activity ]
  })
  activity.define({
    children: [ section ],
    activityFeedback: [ activityFeedback ]
  })
  section.define({
    children: [ page ]
  })
  page.define({
    children: [ question ]
  })
  question.define({
    answers: [ answer ]
  })
  answer.define({
    feedbacks: [ feedback ]
  })

  const reportType = camelizedJson.report.type
  const response = normalize(migrate(camelizedJson), {
    report: reportType === 'Investigation' ? investigation : activity,
    'class': {
      students: [ student ]
    }
  })
  // Post-process response:
  // Provide fake investigation if it's not present to simplify app logic.
  if (reportType === 'Activity') {
    response.entities.investigations = {
      1: {
        id: 1,
        name: '',
        type: 'Investigation',
        children: [response.result.report]
      }
    }
  }
  response.type = camelizedJson.reportFor || DEFAULT_REPORT_FOR
  response.hideControls = camelizedJson.hideControls || false
  applyVisibilityFilter(response.entities.questions, response.result.visibilityFilter)
  copyAnswerKeysToObjects(response.entities.answers || [])
  copyAnswerKeysToObjects(response.entities.activityFeedbacks || [])
  saveStudentsRealNames(response.entities.students)
  urlParamOverrides(response)
  return response
}

function applyVisibilityFilter (questions, visibilityFilter) {
  Object.values(questions).forEach(question => {
    question.selected = false
    question.selectedConfirmed = false
    question.visible = false
  })
  visibilityFilter.questions.forEach(key => {
    // in some cases, we will only be looking at a subset of questions,
    // for example when viewing the activity report for a sequence.
    // There may not be a question for the key. Check first.
    if (questions[key]) {
      questions[key].selected = true
      questions[key].selectedConfirmed = true
      questions[key].visible = true
    }
  })
}

// Keys are generated by normalizr above, so just copy them to the object hashes.
function copyAnswerKeysToObjects (answers) {
  Object.keys(answers).forEach(key => {
    answers[key].key = key
  })
}

// Provide additional property in student hash, it's useful for anonymization.
function saveStudentsRealNames (students) {
  Object.values(students).forEach(student => {
    student.realName = student.name
  })
}

function urlParamOverrides (response) {
  const {reportFor, studentId} = queryString.parse(window.location.search)
  if (reportFor) {
    response.type = reportFor
  }
  if (studentId && reportFor === 'student') {
    response.studentId = studentId
    response.hideControls = true
    if (response.result) {
      response.result.hideControls = true
    }
  }
}
