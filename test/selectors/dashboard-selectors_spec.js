import { expect } from 'chai'
import { describe, it } from 'mocha'
import { fromJS } from 'immutable'
import {
  getSortedStudents,
  getStudentProgress,
  getStudentAverageProgress,
  getSelectedQuestion
} from '../../js/selectors/dashboard-selectors'

import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS } from '../../js/actions/dashboard'

describe('dashboard selectors', () => {
  const s1 = { id: 1, firstName: 'Y', lastName: 'aA' }
  const s2 = { id: 2, firstName: 'x', lastName: 'AA' }
  const s3 = { id: 3, firstName: 'Z', lastName: 'a' }

  const state = ({ sortBy = SORT_BY_NAME }) => fromJS({
    report: {
      students: { 1: s1, 2: s2, 3: s3 },
      activities: {
        1: { children: [ 1 ] },
        2: { children: [ 2 ] }
      },
      sections: {
        1: { children: [ 1 ] },
        2: { children: [ 2 ] }
      },
      pages: {
        1: { children: [ 'Q1' ] },
        2: { children: [ 'Q2', 'Q3' ] }
      },
      questions: {
        Q1: { answers: [ 'A1', 'A2' ] }, // activity 1
        Q2: { answers: [ 'A3', 'A4' ] }, // activity 2
        Q3: { answers: [ 'A5', 'A6' ] } // activity 2
      },
      answers: {
        A1: { studentId: 1, type: 'SomeAnswer', submitted: true },
        A2: { studentId: 2, type: 'SomeAnswer', submitted: true },
        A3: { studentId: 1, type: 'SomeAnswer', submitted: false },
        A4: { studentId: 2, type: 'SomeAnswer', submitted: true },
        A5: { studentId: 1, type: 'SomeAnswer', submitted: true },
        A6: { studentId: 2, type: 'NoAnswer' }
      }
    },
    dashboard: {
      sortBy
    }
  })

  describe('getStudentProgress', () => {
    it('should return hash with student progress', () => {
      expect(getStudentProgress(state({})).toJS()).to.eql(
        {
          1: {
            1: 1, // activity 1
            2: 0.5 // activity 2 - only one submitted answer
          },
          2: {
            1: 1, // activity 1
            2: 0.5 // activity 2 - one submitted answer
          },
          3: { // this student hasn't started any activity, no answer objects
            1: 0,
            2: 0
          }
        }
      )
    })
  })

  describe('getStudentAverageProgress', () => {
    it('should return hash with student total progress', () => {
      expect(getStudentAverageProgress(state({})).toJS()).to.eql(
        {
          1: 0.75,
          2: 0.75,
          3: 0
        }
      )
    })
  })

  describe('getSortedStudents', () => {
    describe('when sorting by name', () => {
      it('should return sorted list of students', () => {
        expect(getSortedStudents(state({})).toJS()).to.eql(
          // Students sorted by name (last name first, ignoring capitalization)
          [ s3, s2, s1 ]
        )
      })
    })

    describe('when sorting by most progress', () => {
      it('should return sorted list of students', () => {
        expect(getSortedStudents(state({sortBy: SORT_BY_MOST_PROGRESS})).toJS()).to.eql(
          // Students sorted by most progress (ties broken alphabetically)
          [ s2, s1, s3 ]
        )
      })
    })

    describe('when sorting by least progress', () => {
      it('should return sorted list of students', () => {
        expect(getSortedStudents(state({sortBy: SORT_BY_LEAST_PROGRESS})).toJS()).to.eql(
          // Students sorted by least progress (ties broken alphabetically)
          [ s3, s2, s1 ]
        )
      })
    })

    describe('getSelectedQuestion', () => {
      const state = ({ selectedQuestion = null }) => fromJS({
        report: {
          questions: {
            Q1: { prompt: 'prompt1', answers: [ 'A1', 'A2' ] },
            Q2: { prompt: 'prompt2', answers: [ 'A3', 'A4' ] }
          },
          answers: {
            A1: { studentId: 1, answer: 'answer one', correct: false },
            A2: { studentId: 1, answer: 'answer two', correct: true },
            A3: { studentId: 1, answer: 'answer three', correct: false },
            A4: { studentId: 1, answer: 'answer four', correct: false }
          },
          students: {
            1: { id: 1, firstName: 'Y', lastName: 'aA' }
          }
        },
        dashboard: {
          selectedQuestion: selectedQuestion
        }
      })

      describe('When no question is selected', () => {
        it('should return an empty map', () => {
          expect(getSelectedQuestion(state({selectedQuestion: null})).toJS()).to.eql({})
        })
      })

      describe('When Q1 is selected', () => {
        it('Should return the prompt for the first question ...', () => {
          const s = state({selectedQuestion: 'Q1'})
          const question = getSelectedQuestion(s).toJS()
          expect(question.prompt).to.eql('prompt1')
        })
      })
      
      describe('When Q2 is selected', () => {
        it('Should return the prompt for the second question ...', () => {
          const s = state({selectedQuestion: 'Q2'})
          const question = getSelectedQuestion(s).toJS()
          expect(question.prompt).to.eql('prompt2')
        })
      })
    })
  })
})
