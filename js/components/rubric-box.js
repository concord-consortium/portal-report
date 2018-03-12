import React, { PureComponent } from 'react'
import '../../css/rubric-box.less'

export default class RubricBox extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
    this.updateSelection = this.updateSelection.bind(this)
  }

  updateSelection (evt, critId, ratingId) {
    const { rubric, rubricChange, rubricFeedback } = this.props
    const change = {}
    const rating = rubric.ratings.find((r) => r.id === ratingId)
    const criteria = rubric.criteria.find((c) => c.id === critId)
    const score = rating.score
    const label = rating.label
    change[critId] = {
      id: ratingId,
      score: score,
      label: label,
      description: criteria.ratingDescriptions[ratingId]
    }
    const newFeedback = Object.assign({}, rubricFeedback, change)
    rubricChange(newFeedback)
  }

  render () {
    const { rubric, rubricFeedback, learnerId } = this.props
    if (!rubric) { return null } else {
      return (
        <div className='rubric-box'>
          <table>
            <thead>
              <tr>
                <th key='xxx'> Aspects of Proficiency</th>
                {
                  rubric.ratings.map((rating) => <th key={rating.id}>{rating.label}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {
                rubric.criteria.map((crit) => {
                  return (
                    <tr key={crit.id}>
                      <td>{crit.description}</td>
                      {
                        rubric.ratings.map((rating) => {
                          const critId = crit.id
                          const ratingId = rating.id
                          const radioButtonKey = `${critId}-${ratingId}`
                          const checked = rubricFeedback &&
                            rubricFeedback[critId] &&
                            rubricFeedback[critId].id === ratingId

                          return (
                            <td key={radioButtonKey}>
                              <div className='center'>
                                <input
                                  name={`${learnerId}_${critId}`}
                                  type='radio'
                                  checked={checked}
                                  value={ratingId}
                                  onChange={(e) => this.updateSelection(e, critId, ratingId)}
                                  id={radioButtonKey} />
                              </div>
                            </td>
                          )
                        })
                      }

                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )
    }
  }
}
