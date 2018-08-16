import { expect } from 'chai'
import { describe, it } from 'mocha'
import dashboardReducer from '../../js/reducers/dashboard-reducer'
import * as types from '../../js/actions/dashboard'

describe('dashboard reducer', () => {
  it('should return the initial state', () => {
    expect(dashboardReducer(undefined, {}).toJS()).to.eql(
      {
        sortBy: types.SORT_BY_NAME,
        expandedActivities: {},
        expandedQuestions: {},
        expandedStudents: {},
        selectedQuestion: {}
      }
    )
  })

  it('should handle SET_ACTIVITY_EXPANDED', () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_ACTIVITY_EXPANDED,
      activityId: 123,
      value: true
    })
    expect(state1.get('expandedActivities').toJS()).to.eql(
      { 123: true }
    )

    const state2 = dashboardReducer(state1, {
      type: types.SET_ACTIVITY_EXPANDED,
      activityId: 123,
      value: false
    })
    expect(state2.get('expandedActivities').toJS()).to.eql(
      { 123: false }
    )
  })

  it('should handle SET_STUDENT_EXPANDED', () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_STUDENT_EXPANDED,
      studentId: 123,
      value: true
    })
    expect(state1.get('expandedStudents').toJS()).to.eql(
      { 123: true }
    )

    const state2 = dashboardReducer(state1, {
      type: types.SET_STUDENT_EXPANDED,
      studentId: 123,
      value: false
    })
    expect(state2.get('expandedStudents').toJS()).to.eql(
      { 123: false }
    )
  })

  it('should handle SET_STUDENTS_EXPANDED', () => {
    const state1 = dashboardReducer(undefined, {
      type: types.SET_STUDENTS_EXPANDED,
      studentIds: [1, 2, 3],
      value: true
    })
    expect(state1.get('expandedStudents').toJS()).to.eql(
      { 1: true, 2: true, 3: true }
    )

    const state2 = dashboardReducer(state1, {
      type: types.SET_STUDENTS_EXPANDED,
      studentIds: [1, 2],
      value: false
    })
    expect(state2.get('expandedStudents').toJS()).to.eql(
      { 1: false, 2: false, 3: true }
    )
  })

  it('should handle SELECT_QUESTION', () => {
    const someQuestion = {id: 1, prompt: 'this is the prompt', answers: []}
    const state1 = dashboardReducer(undefined, {
      type: types.SELECT_QUESTION,
      value: someQuestion
    })
    expect(state1.get('selectedQuestion')).to.eql(someQuestion)

    const state2 = dashboardReducer(state1, {
      type: types.SELECT_QUESTION,
      value: null
    })
    expect(state2.get('selectedQuestion')).to.eql(null)
  })
})
