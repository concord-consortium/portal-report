import React, { PureComponent } from 'react'
import ActivityHeader from './activity-header'
import ActivityColumn from './activity-column'

import css from '../../../css/dashboard/dashboard.less'

const BOTTOM_MARGIN = 10 // px

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

  render () {
    const { report, students, activityProgress } = this.props
    return (
      <div className={css.dashboard}>
        <div ref={el => { this.headers = el }} className={css.headers}>
          {
            report.get('children').map(a =>
              <ActivityHeader key={a.get('id')} activity={a} />
            )
          }
        </div>
        <div ref={el => { this.verticalScrollingContainer = el }} className={css.verticalScrollContainer}>
          <div className={css.studentNames}>
            {
              students.toArray().map(s =>
                <div key={s.get('id')} className={css.studentName}>{ s.get('lastName') }, { s.get('firstName')}</div>
              )
            }
          </div>
          <div ref={el => { this.horizontalScrollingContainer = el }} className={css.horizontalScrollContainer}>
            {
              report.get('children').map(a =>
                <ActivityColumn key={a.get('id')} activity={a} students={students} studentsProgress={activityProgress.get(a.get('id').toString())} />
              )
            }
          </div>
        </div>
      </div>
    )
  }
}
