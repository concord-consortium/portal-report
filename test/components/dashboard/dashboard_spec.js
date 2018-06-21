import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { shallow } from 'enzyme'
import { fromJS } from 'immutable'
import Dashboard from '../../../js/components/dashboard/dashboard'
import StudentName from '../../../js/components/dashboard/student-name'
import ActivityName from '../../../js/components/dashboard/activity-name'
import SortByDropdown from '../../../js/components/dashboard/sort-by-dropdown'
import ActivityQuestions from '../../../js/components/dashboard/activity-questions'
import ActivityAnswers from '../../../js/components/dashboard/activity-answers'

describe('<Dashboard />', () => {
  it('should render student names', () => {
    const students = fromJS([ { id: 1 }, { id: 2 }, { id: 3 } ])
    const wrapper = shallow(<Dashboard students={students} />)
    expect(wrapper.find(StudentName)).to.have.length(3)
  })

  it('should render activity names', () => {
    const activities = fromJS({ 1: { id: 1 }, 2: { id: 2 } })
    const wrapper = shallow(<Dashboard activities={activities} />)
    expect(wrapper.find(ActivityName)).to.have.length(2)
  })

  it('should render sort method dropdown', () => {
    const wrapper = shallow(<Dashboard />)
    expect(wrapper.find(SortByDropdown)).to.have.length(1)
  })

  it('synchronizes width of activity name, question prompts and activity answers', () => {
    const students = fromJS([ { id: 1 } ])
    const activities = fromJS({ 1: { id: 1, questions: [ 1, 2, 3 ] }, 2: { id: 2 } })
    const expandedActivities = fromJS({ 1: true }) // expand the first activity
    const wrapper = shallow(<Dashboard students={students} activities={activities} expandedActivities={expandedActivities} />)

    const activityWidth = wrapper.find(ActivityName).first().prop('width')
    const questionPromptsWidth = wrapper.find(ActivityQuestions).first().prop('width')
    const activityAnswersWidth = wrapper.find(ActivityAnswers).first().prop('width')

    expect(activityWidth).to.equal(questionPromptsWidth)
    expect(questionPromptsWidth).to.equal(activityAnswersWidth)
  })
})
