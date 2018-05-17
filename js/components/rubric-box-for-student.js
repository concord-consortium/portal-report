import React, { PureComponent } from 'react'
import { RubricHelper } from '../util/rubric-helper'
import '../../css/rubric-box-for-student.less'

export default class RubricBoxForStudent extends PureComponent {
  render () {
    const { rubric, rubricFeedback } = this.props
    const helper = new RubricHelper(rubric, rubricFeedback)

    const feedbacks = helper.allFeedback('student').filter(f => !!f).map(f =>
      <tr className='criterion' key={f.key}>
        <td className='description'>{f.description}</td>
        <td className='rating'>
          <span className='rating-label'>{f.label}</span>
          { rubric.showRatingDescriptions && ` - ${f.ratingDescription}` }
        </td>
      </tr>
    )

    if (feedbacks.length > 0) {
      return (
        <table className='rubric-box-for-student'>
          <tbody>
            <tr>
              <th>{ helper.criteriaLabel('student') }</th><th>{ helper.feedbackLabel('student') }</th>
            </tr>
            { feedbacks }
          </tbody>
        </table>
      )
    }
    return null
  }
}
