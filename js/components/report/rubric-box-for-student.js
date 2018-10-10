import React, { PureComponent } from 'react'
import Markdown from 'markdown-to-jsx'
import { RubricHelper } from '../../util/rubric-helper'
import '../../../css/report/rubric-box-for-student.less'

export default class RubricBoxForStudent extends PureComponent {
  render () {
    const { rubric, rubricFeedback } = this.props
    const helper = new RubricHelper(rubric, rubricFeedback)

    const feedbacks = helper.allFeedback('student').filter(f => !!f).map(f =>
      <tr className='criterion' key={f.key}>
        <td className='description'><Markdown>{f.description}</Markdown></td>
        <td className='rating'>
          <span className='rating-label'>{f.label}</span>
          <Markdown>
            { rubric.showRatingDescriptions && ` - ${f.ratingDescription}` }
          </Markdown>
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
