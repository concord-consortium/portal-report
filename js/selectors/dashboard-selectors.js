import { createSelector } from 'reselect'
import { getActivityTrees } from './report-tree'

// Inputs
const getStudents = state => state.getIn(['report', 'students'])
const getDashboardSortBy = state => state.getIn(['dashboard', 'sortBy'])

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
        const activityQuestions = activity.get('questions')
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

// Returns sorted students.
export const getSortedStudents = createSelector(
  [ getStudents, getDashboardSortBy ],
  (students, sortBy) => {
    if (sortBy === 'name') {
      return students.toList().sortBy(student =>
        (student.get('lastName') + ' ' + student.get('firstName')).toLowerCase()
      )
    }
  }
)
