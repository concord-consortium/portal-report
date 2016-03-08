// Generates tree that is consumed by React components from reportState (ImmutableJS Map).
// It includes all the properties provided by API + calculates a few additional ones.
export default function reportTree(reportState) {
  // There is always only one investigation.
  const investigation = reportState.get('investigations').values().next().value.toJS()
  investigation.children = investigation.children.map(id => activity(reportState, id))
  return investigation
}

function activity(state, id) {
  // Why id.toString()? https://facebook.github.io/immutable-js/docs/#/fromJS
  const activity = state.get('activities').get(id.toString()).toJS()
  activity.children = activity.children.map(id => section(state, id))
  // Activity is visible only if at least one section is visible.
  activity.visible = activity.children.find(s => s.visible)
  return activity
}

function section(state, id) {
  const section = state.get('sections').get(id.toString()).toJS()
  section.children = section.children.map(id => page(state, id))
  // Section is visible only if at least one page is visible.
  section.visible = section.children.find(p => p.visible)
  // Hide section titles for external activities.
  section.nameHidden = state.get('hideSectionNames')
  return section
}

function page(state, id) {
  const page = state.get('pages').get(id.toString()).toJS()
  page.children = page.children.map(id => question(state, id))
  // Page is visible only if at least one question is visible.
  page.visible = page.children.find(q => q.visible)
  return page
}

function question(state, id) {
  const question = state.get('questions').get(id.toString()).toJS()
  question.children = question.children.map(id => answer(state, id))
  // Question is visible if it's selected or visibility filter is inactive.
  question.visible = question.visible || !state.get('visibilityFilterActive')
  return question
}

function answer(state, id) {
  const answer = state.get('answers').get(id.toString()).toJS()
  answer.student = student(state, answer.studentId)
  return answer
}

function student(state, id) {
  const student = state.get('students').get(id.toString()).toJS()
  if (state.get('anonymousReport')) {
    student.name = 'Student ' + student.id
  }
  return student
}
