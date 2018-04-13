import React, { PureComponent } from 'react'
import chroma from 'chroma-js'
import '../../css/summary-indicator.less'

export default class SummaryIndicator extends PureComponent {
  renderLabel (label) {
    return <span className='label'> {label} : </span>
  }

  renderAvgScore (label) {
    const {scores, maxScore} = this.props
    const avgScore = scores.reduce((p, c) => p + c, 0) / scores.length
    const roundedAvg = Math.round(avgScore * 10) / 10
    return avgScore
      ? <span className='value'> {roundedAvg} / {maxScore}</span>
      : null
  }

  renderRubricRow (rowNumbers) {
    const width = 40
    const total = rowNumbers.reduce((p, c) => p + c, 0)
    const colors = chroma.scale(['hsl(198, 0%, 95%)', 'hsl(198, 100%, 25%)']).colors(rowNumbers.length)
    const scale = (x) => x / total * width
    const style = (value, index) => {
      return {
        height: '20px',
        width: `${scale(value)}px`,
        backgroundColor: colors[index]
      }
    }
    return (
      <div className='rubric-row'>
        {rowNumbers.map((value, index) => <div style={style(value, index)} />)}
      </div>
    )
  }

  renderRubricSummary () {
    const {rubricFeedbacks, rubric} = this.props
    if (!rubric || !rubricFeedbacks || rubricFeedbacks.length < 1) { return }
    const rows = rubric.criteria.map((criteria) => {
      const cid = criteria.id
      const rowMap = rubric.ratings.map((r, i) => {
        const rid = r.id
        return rubricFeedbacks.reduce((p, c) => {
          if (c[cid] && c[cid].id === rid) {
            return p + 1
          }
          return p
        }, 0)
      })
      return rowMap
    })
    return (
      <div className='rubric-summary'>
        {rows.map((r) => this.renderRubricRow(r))}
      </div>
    )
  }

  render () {
    const {scores, useRubric, showScore, rubricFeedbacks} = this.props
    const _showScore = showScore && scores && scores.length > 0
    const showRubric = useRubric && rubricFeedbacks && rubricFeedbacks.length > 0
    const showLabel = showRubric || showScore
    const label = _showScore
      ? 'Avg. Score'
      : 'Rubric Summary'
    return (
      <div className='summary-indicator'>
        <div className='avg-score'>
          { showLabel ? this.renderLabel(label) : null }
          { _showScore ? this.renderAvgScore() : null}
        </div>
        { showRubric ? this.renderRubricSummary() : null}
      </div>
    )
  }
}
