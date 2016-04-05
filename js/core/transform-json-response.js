import { normalize, Schema, arrayOf } from 'normalizr'
import humps from 'humps'

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
export default function transformJSONResponse(json) {
  const camelizedJson = humps.camelizeKeys(json)

  const student = new Schema('students')
  const investigation = new Schema('investigations')
  const activity = new Schema('activities')
  const section = new Schema('sections')
  const page = new Schema('pages')
  const question = new Schema('questions', {idAttribute: (q) => q.key})
  // Answers don't have unique ID so generate it. Embeddable key + student ID works.
  const answer = new Schema('answers', {idAttribute: (a) => `${a.embeddableKey}-${a.studentId}`})
  investigation.define({
    children: arrayOf(activity)
  })
  activity.define({
    children: arrayOf(section)
  })
  section.define({
    children: arrayOf(page)
  })
  page.define({
    children: arrayOf(question)
  })
  question.define({
    answers: arrayOf(answer)
  })

  const reportType = camelizedJson.report.type
  const response = normalize(camelizedJson, {
    report: reportType === 'Investigation' ? investigation : activity,
    'class': {
      students: arrayOf(student)
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
  response.type  = camelizedJson.reportFor || DEFAULT_REPORT_FOR
  applyVisibilityFilter(response.entities.questions, response.result.visibilityFilter)
  copyAnswerKeysToObjects(response.entities.answers || [])
  saveStudentsRealNames(response.entities.students)
  return response
}

function applyVisibilityFilter(questions, visibilityFilter) {
  Object.values(questions).forEach(question => {
    question.selected = false
    question.visible = false
  })
  visibilityFilter.questions.forEach(key => {
    questions[key].selected = true
    questions[key].visible = true
  })
}

// Keys are generated by normalizr above, so just copy them to the object hashes.
function copyAnswerKeysToObjects(answers) {
  Object.keys(answers).forEach(key => {
    answers[key].key = key
  })
}

// Provide additional property in student hash, it's useful for anonymization.
function saveStudentsRealNames(students) {
  Object.values(students).forEach(student => {
    student.realName = student.name
  })
}
