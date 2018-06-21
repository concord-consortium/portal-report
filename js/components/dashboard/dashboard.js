import React, { PureComponent } from 'react'
import ActivityName from './activity-name'
import StudentName from './student-name'
import ActivityQuestions from './activity-questions'
import ActivityAnswers from './activity-answers'
import SortByDropdown from './sort-by-dropdown'
import { Map, List } from 'immutable'

import css from '../../../css/dashboard/dashboard.less'

const BOTTOM_MARGIN = 10 // px
const COLLAPSED_ACTIVITY_WIDTH = 250 // px
const COLLAPSED_ANSWER_WIDTH = 120 // px
const FULL_ANSWER_WIDTH = 350 // px

export default class Dashboard extends PureComponent {
  constructor (props) {
    super(props)
    this.onResize = this.onResize.bind(this)
    this.onHorizontalContainerScroll = this.onHorizontalContainerScroll.bind(this)
    this.onHeadersScroll = this.onHeadersScroll.bind(this)
  }

  componentDidMount () {
    // Make sure that the verticalScrollContainer fits the window height.
    window.addEventListener('resize', this.onResize)
    // Synchronize scrolling of headers and horizontalScrollContainer.
    this.horizontalScrollingContainer.addEventListener('scroll', this.onHorizontalContainerScroll)
    this.headers.addEventListener('scroll', this.onHeadersScroll)
    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
    this.horizontalScrollingContainer.removeEventListener('scroll', this.onHorizontalContainerScroll)
    this.headers.removeEventListener('scroll', this.onHeadersScroll)
  }

  onResize () {
    // Make sure that the verticalScrollContainer fits the window height.
    const bb = this.verticalScrollingContainer.getBoundingClientRect()
    this.verticalScrollingContainer.style.height = (window.innerHeight - bb.y - BOTTOM_MARGIN) + 'px'
  }

  onHorizontalContainerScroll () {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.headers, this.onHeadersScroll)
    this.headers.scrollLeft = this.horizontalScrollingContainer.scrollLeft
  }

  onHeadersScroll () {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.horizontalScrollingContainer, this.onHorizontalContainerScroll)
    this.horizontalScrollingContainer.scrollLeft = this.headers.scrollLeft
  }

  ignoreNextScrollEvent (element, originalHandler) {
    // Temporarily replace scroll handler and restore it after it's triggered once.
    const temporaryHandler = () => {
      element.removeEventListener('scroll', temporaryHandler)
      element.addEventListener('scroll', originalHandler)
    }
    element.removeEventListener('scroll', originalHandler)
    element.addEventListener('scroll', temporaryHandler)
  }

  getActivityColumnWidth (activity) {
    const { expandedActivities, expandedStudents } = this.props
    if (expandedActivities.get(activity.get('id').toString())) {
      const showFullPrompts = expandedStudents.includes(true)
      const questionWidth = showFullPrompts ? FULL_ANSWER_WIDTH : COLLAPSED_ANSWER_WIDTH
      return Math.max(COLLAPSED_ACTIVITY_WIDTH, (activity.get('questions').count() * questionWidth)) + 'px'
    }
    return COLLAPSED_ACTIVITY_WIDTH + 'px'
  }

  render () {
    const { activities, students, studentProgress, expandedStudents, expandedActivities, setActivityExpanded, setStudentExpanded, setStudentSort } = this.props
    const anyStudentExpanded = expandedStudents.includes(true)
    const activitiesList = activities.toList()
    return (
      <div className={css.dashboard}>
        <SortByDropdown setStudentSort={setStudentSort} />
        <div ref={el => { this.headers = el }} className={css.headers}>
          <div>
            {
              activitiesList.map(a =>
                <ActivityName key={a.get('id')} activity={a} width={this.getActivityColumnWidth(a)} expanded={expandedActivities.get(a.get('id').toString())} setActivityExpanded={setActivityExpanded} />
              )
            }
          </div>
          <div className={css.questionPromptsRow + ' ' + (anyStudentExpanded ? css.fullPrompts : '')}>
            {
              activitiesList.map(a =>
                <ActivityQuestions key={a.get('id')} activity={a} width={this.getActivityColumnWidth(a)} expanded={expandedActivities.get(a.get('id').toString())} showFullPrompts={anyStudentExpanded} />
              )
            }
          </div>
        </div>
        <div ref={el => { this.verticalScrollingContainer = el }} className={css.verticalScrollContainer}>
          <div className={css.studentNames}>
            {
              students.map(s =>
                <StudentName key={s.get('id')} student={s} expanded={expandedStudents.get(s.get('id').toString())} setStudentExpanded={setStudentExpanded} />
              )
            }
          </div>
          <div ref={el => { this.horizontalScrollingContainer = el }} className={css.horizontalScrollContainer}>
            {
              students.map(s =>
                <div key={s.get('id')} className={css.studentAnswersRow + ' ' + (expandedStudents.get(s.get('id').toString()) ? css.fullAnswers : '')}>
                  {
                    activitiesList.map(a =>
                      <ActivityAnswers key={a.get('id')} activity={a} student={s}
                        width={this.getActivityColumnWidth(a)}
                        expanded={expandedActivities.get(a.get('id').toString())}
                        showFullAnswers={expandedStudents.get(s.get('id').toString())}
                        progress={studentProgress.getIn([s.get('id').toString(), a.get('id').toString()])}
                      />
                    )
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

Dashboard.defaultProps = {
  activities: Map(),
  students: List(),
  expandedStudents: Map(),
  expandedActivities: Map(),
  studentProgress: Map()
}