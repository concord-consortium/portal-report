import { Map } from 'immutable'

// Generates tree that is consumed by React components from reportState (ImmutableJS Map).
// It includes all the properties provided by API + calculates a few additional ones.
export default function reportData(reportState) {
  return reportState.set('investigation', investigation(reportState))
}

export function investigation(state) {
  // There is always only one investigation.
  const investigation = state.get('investigations').values().next().value
  return investigation.set('children', investigation.get('children').map(id => activity(state, id)))
}

export function activity(state, id) {
  // Why id.toString()? https://facebook.github.io/immutable-js/docs/#/fromJS
  const activity = state.get('activities').get(id.toString())
  const mappedChildren = activity.get('children').map(id => section(state, id))
  return activity.set('children', mappedChildren)
                 // Activity is visible only if at least one section is visible.
                 .set('visible', mappedChildren.find(s => s.get('visible')))
}

export function section(state, id) {
  const section = state.get('sections').get(id.toString())
  const mappedChildren = section.get('children').map(id => page(state, id))
  return section.set('children', mappedChildren)
                // Section is visible only if at least one page is visible.
                .set('visible', mappedChildren.find(p => p.get('visible')))
                // Hide section titles for external activities.
                .set('nameHidden', state.get('hideSectionNames'))
}

export function page(state, id) {
  const page = state.get('pages').get(id.toString())
  const mappedChildren = page.get('children').map(id => question(state, id))
  return page.set('children', mappedChildren)
             // Page is visible only if at least one question is visible.
             .set('visible', mappedChildren.find(q => q.get('visible')))
}

export function question(state, key) {
  const question = state.get('questions').get(key.toString())
                  // Sort answers by student name, so views don't have to care about it.
  return question.set('answers', question.get('answers').map(key => answer(state, key))
                                                          .sortBy(a => a.getIn(['student', 'name'])))
                 // Question is visible if it's selected or visibility filter is inactive.
                 .set('visible', question.get('visible') || !state.get('visibilityFilterActive'))
}

export function answer(state, key) {
  const answer = state.get('answers').get(key.toString())
  return answer.set('student', student(state, answer.get('studentId')))
}

export function student(state, id) {
  return state.get('students').get(id.toString())
}
