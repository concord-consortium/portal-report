import { createSelector } from 'reselect'

// `getInvestigationTree` generates tree that is consumed by React components from reportState (ImmutableJS Map).
// Redux state has flat structure. This selector maps all the IDs and keys and creates a tree-like hierarchy.
// It includes all the properties provided by API + calculates a few additional ones.

// Inputs
const getInvestigations = state => state.get('report').get('investigations')
const getActivities = state => state.get('report').get('activities')
const getPages = state => state.get('report').get('pages')
const getSections = state => state.get('report').get('sections')
const getQuestions = state => state.get('report').get('questions')
const getAnswers = state => state.get('report').get('answers')
const getStudents = state => state.get('report').get('students')
const getHideSectionNames = state => state.get('report').get('hideSectionNames')

export const getAnswerTrees = createSelector(
  [ getAnswers, getStudents ],
  (answers, students) =>
    answers.map(answer =>
      answer.set('student', students.get(answer.get('studentId').toString()))
    )
)

export const getQuestionTrees = createSelector(
  [ getQuestions, getAnswerTrees ],
  (questions, answerTrees) =>
    questions.map(question => {
      const mappedAnswers = question.get('answers').map(key => answerTrees.get(key))
      // Sort answers by student name, so views don't have to care about it.
      const sortedAnswers = mappedAnswers.sortBy(a => a.getIn(['student', 'name']))
      return question
        .set('answers', sortedAnswers)
    })
)

export const getPageTrees = createSelector(
  [ getPages, getQuestionTrees ],
  (pages, questionTrees) =>
    pages.map(page => {
      const mappedChildren = page.get('children').map(key => questionTrees.get(key))
      return page
        .set('children', mappedChildren)
        // Page is visible only if at least one question is visible.
        .set('visible', mappedChildren.find(q => q.get('visible')))
    })
)

export const getSectionTrees = createSelector(
  [ getSections, getPageTrees, getHideSectionNames ],
  (sections, pageTrees, hideSectionNames) =>
    sections.map(section => {
      const mappedChildren = section.get('children').map(id => pageTrees.get(id.toString()))
      return section
        .set('children', mappedChildren)
        // Section is visible only if at least one page is visible.
        .set('visible', mappedChildren.find(p => p.get('visible')))
        // Hide section titles for external activities.
        .set('nameHidden', hideSectionNames)
    })
)

export const getActivityTrees = createSelector(
  [ getActivities, getSectionTrees ],
  (activities, sectionTrees) =>
    activities.map(activity => {
      const mappedChildren = activity.get('children').map(id => sectionTrees.get(id.toString()))
      return activity
        .set('children', mappedChildren)
        // Activity is visible only if at least one section is visible.
        .set('visible', mappedChildren.find(s => s.get('visible')))
    })
)

export const getInvestigationTree = createSelector(
  [ getInvestigations, getActivityTrees ],
  (investigations, activityTrees) => {
    // There is always only one investigation.
    const investigation = investigations.values().next().value
    const mappedChildren = investigation.get('children').map(id => activityTrees.get(id.toString()))
    return investigation
      .set('children', mappedChildren)
  }
)

export default getInvestigationTree
