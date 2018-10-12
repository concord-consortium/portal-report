import React, { PureComponent } from 'react'
import Markdown from 'markdown-to-jsx'
import colorScale from '../../util/colors'

import '../../../css/report/rubric-box.less'

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

  renderInput(learnerId, critId, checked, ratingId, radioButtonKey) {
    return (
      <input
        name={`${learnerId}_${critId}`}
        type='radio'
        checked={checked}
        value={ratingId}
        onChange={(e) => this.updateSelection(e, critId, ratingId)}
        id={radioButtonKey} />
    );
  }

  renderCell(learnerId, critId, checked, ratingId, disabled, radioButtonKey) {
    return (
      <div className='center'>
        {disabled ? <span id={radioButtonKey}>N/A</span> : this.renderInput(learnerId, critId, checked, ratingId, radioButtonKey)}
      </div>
    );
  }

  renderLearnerRating (crit, rating, learnerId, rubricFeedback) {
    const {disabled} = this.props
    const critId = crit.id
    const ratingId = rating.id
    const radioButtonKey = `${critId}-${ratingId}`
    const checked = !!(rubricFeedback && rubricFeedback[critId] && rubricFeedback[critId].id === ratingId)
    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (crit.ratingDescriptionsForStudent && crit.ratingDescriptionsForStudent[ratingId]) ||
      (crit.ratingDescriptions && crit.ratingDescriptions[ratingId]) ||
      null
    const isApplicableRating = crit.nonApplicableRatings === undefined ||
                               crit.nonApplicableRatings.indexOf(ratingId) < 0
    return (
      <td key={radioButtonKey} title={(disabled || isApplicableRating) ? ratingDescription : "Not Applicable"}>
        {this.renderCell(learnerId, critId, checked, ratingId, disabled || !isApplicableRating, radioButtonKey)}
      </td>
    )
  }

  renderSummaryRating (crit, critIndex, rating, ratingIndex, max) {
    const colors = colorScale(max)
    const tableStyle = { backgroundColor: colors[ratingIndex] }
    // Tooltips displayed to teacher should actually show student description if it's available.
    const ratingDescription =
      (crit.ratingDescriptionsForStudent && crit.ratingDescriptionsForStudent[rating.id]) ||
      (crit.ratingDescriptions && crit.ratingDescriptions[rating.id]) ||
      null
    const { rowMaps } = this.props
    const values = rowMaps[critIndex]
    const sum = values.reduce((p, c) => p + c, 0)
    const value = Math.round(values[ratingIndex] / sum * 1000) / 10
    // Render check mark when there's data for only one student (instead of 100% and 0%).
    const valueText = sum > 1 ? `${value}%` : (value === 100 ? '✔' : '')
    return (
      <td key={`${crit.id}-${rating.id}`} style={tableStyle} title={ratingDescription}>
        <div className='center'>
          <div className='summary-cell-value'>{ valueText }</div>
        </div>
      </td>
    )
  }

  render () {
    const { rubric, rubricFeedback, learnerId } = this.props

    if (!rubric) { return null }
    const linkLabel = 'Scoring Guide'
    const { ratings, criteria, referenceURL } = rubric
    // learnerID indicates we are displaying a user (not a summary)
    const isSummaryView = !learnerId
    const referenceLink = referenceURL
      ? <div className='reference-link'>
        <a href={referenceURL} target='_blank'> {linkLabel}</a>
      </div>
      : null
    return (
      <div className='rubric-box'>
        {referenceLink}
        <table>
          <thead>
            <tr>
              <th key='Proficiency'>{ rubric.criteriaLabel }</th>
              {
                rubric.ratings.map((rating) => {
                  const label = rating.label
                  const score = rubric.scoreUsingPoints && rating.score ? `(${rating.score})` : ''
                  return <th key={rating.id}>{label} {score}</th>
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              criteria.map((crit, critIndex) => {
                return (
                  <tr key={crit.id} id={crit.id}>
                    <td className='description'><Markdown>{crit.description}</Markdown></td>
                    { isSummaryView
                      ? ratings.map((rating, ratingIndex) => this.renderSummaryRating(crit, critIndex, rating, ratingIndex, ratings.length))
                      : ratings.map(rating => this.renderLearnerRating(crit, rating, learnerId, rubricFeedback))
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
