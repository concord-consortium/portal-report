import { expect } from 'chai'
import { describe, it } from 'mocha'
import dashboardReducer from '../../js/reducers/dashboard-reducer'
import * as types from '../../js/actions/dashboard'

describe('dashboard reducer', () => {
  it('should return the initial state', () => {
    expect(dashboardReducer(undefined, {}).toJS()).to.eql(
      {
        sortBy: 'name',
        expandedActivities: {},
        expandedStudents: {}
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
})
