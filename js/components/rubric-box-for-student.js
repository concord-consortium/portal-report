import React, { PureComponent } from 'react'
import { RubricHelper } from '../util/rubric-helper'
import '../../css/rubric-box-for-student.less'

export default class RubricBoxForStudent extends PureComponent {
  shouldNotRender () {
    const { rubric, rubricFeedback } = this.props
    return !rubric && rubricFeedback && rubricFeedback.criteria
  }

  render (_rubricFeedback) {
    const { rubric, rubricFeedback } = this.props

    if (this.shouldNotRender()) return null
    const helper = new RubricHelper(rubric, rubricFeedback)
    const feedbacks = helper.allFeedback('student').map(f => {
      if (f) {
        return (
          <div className='criterion' key={f.key}>
            <span className='description'>{f.description}</span>
            <span className='rating'> – {f.label}{f.ratingDescription}</span>
          </div>
        )
      }
      return null
    })

    if (feedbacks.length > 0) {
      return (
        <div className='rubricFeedback'>
          {feedbacks}
        </div>
      )
    }
    return null
  }
}
