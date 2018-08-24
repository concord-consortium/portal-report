import { createSelector } from 'reselect'
import { getActivityTrees, getQuestionTrees } from './report-tree'
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from '../actions/dashboard'
import { fromJS } from 'immutable'

// Inputs
const getStudents = state => state.getIn(['report', 'students'])
const getDashboardSortBy = state => state.getIn(['dashboard', 'sortBy'])
const getSeletedQuestionId = state => state.getIn(['dashboard', 'selectedQuestion'])

// When a user selects a to display question details by
// Clicking on the question column expand icon.
export const getSelectedQuestion = createSelector(
  [getQuestionTrees, getSeletedQuestionId],
  (questions, id) => {
    if (questions && id) {
      return questions
        .get(id.toString(), fromJS({}))
    }
    return fromJS({})
  }
)

// Selectors

// Returns following hash:
// {
//   <student_id_1>: {
//     <activity_id_1>: 0.8,
//     <activity_id_2>: 0.45,
//     (...)
//   },
//   <student_id_1>: {
//     <activity_id_1>: 0.15,
//     <activity_id_2>: 0.8,
//     (...)
//   },
//   (...)
// }
export const getStudentProgress = createSelector(
  [ getStudents, getActivityTrees ],
  (students, activities) => {
    return students.map(student =>
      activities.map(activity => {
        const activityQuestions = activity.get('questions').filter(q => q.get('visible'))
        const studentSubmittedAnswers = activityQuestions.map(question =>
          question.get('answers')
            .find(answer =>
              answer.get('studentId') === student.get('id') &&
              answer.get('type') !== 'NoAnswer' &&
              // Question is completed by student only if it's there's some answer and it's submitted.
              // Note that non-required answers are "submitted" by default.
              answer.get('submitted') === true
            )
        // Filter out undefined / falsy values, which mean that answer has not been found.
        ).filter(answer => !!answer)
        return studentSubmittedAnswers.size / activityQuestions.size
      })
    )
  }
)

// Returns a mapping from student IDs to their average progress across all activities
export const getStudentAverageProgress = createSelector(
  [ getStudents, getStudentProgress ],
  (students, studentProgress) => {
    return students.map(student => {
      const activitiesProgress = studentProgress.get(student.get('id').toString()).toList()
      return activitiesProgress.reduce((sum, progress) => sum + progress) / activitiesProgress.size
    })
  }
)

// A comparison function to sort students by last and then first name
const compareStudentsByName = (student1, student2) => {
  const lastNameCompare = student1.get('lastName').toLocaleLowerCase().localeCompare(
    student2.get('lastName').toLocaleLowerCase()
  )
  if (lastNameCompare !== 0) {
    return lastNameCompare
  } else {
    return student1.get('firstName').localeCompare(student2.get('firstName'))
  }
}

// Returns sorted students
export const getSortedStudents = createSelector(
  [ getStudents, getDashboardSortBy, getStudentAverageProgress ],
  (students, sortBy, studentProgress) => {
    switch (sortBy) {
      case SORT_BY_NAME:
        return students.toList().sort((student1, student2) =>
          compareStudentsByName(student1, student2)
        )
      case SORT_BY_LEAST_PROGRESS:
      case SORT_BY_MOST_PROGRESS:
        return students.toList().sort((student1, student2) => {
          const student1Progress = studentProgress.get(student1.get('id').toString())
          const student2Progress = studentProgress.get(student2.get('id').toString())
          const progressComp = sortBy === SORT_BY_LEAST_PROGRESS
            ? student1Progress - student2Progress
            : student2Progress - student1Progress
          if (progressComp !== 0) {
            return progressComp
          } else {
            return compareStudentsByName(student1, student2)
          }
        })
      default:
        return students.toList()
    }
  }
)
