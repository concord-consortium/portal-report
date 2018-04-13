import React, { PureComponent } from 'react'
import colorScale from '../util/colors'
import '../../css/rubric-summary.less'
import RubricBox from './rubric-box'
export default class RubricSummary extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showLightbox: false
    }
  }

  openLightBox (event) {
    console.log('open')
    this.setState({showLightbox: true})
  }

  closeLightBox (event) {
    console.log('close')
    event.stopPropagation()
    this.setState({showLightbox: false})
  }

  renderLightBox () {
    const {rubric} = this.props
    const rowMaps = this.getRowMaps()
    return (
      <div className='rubric-lightbox-wrapper'>
        <div className='rubric-lightbox'>
          <div className='closebox' onClick={this.closeLightBox.bind(this)}>✖</div>
          <div className='rubic-summary'>
            <RubricBox rubric={rubric} rowMaps={rowMaps} />
          </div>
        </div>
      </div>
    )
  }
  renderRubricRow (rowNumbers) {
    const width = 32
    const total = rowNumbers.reduce((p, c) => p + c, 0)
    const colors = colorScale(rowNumbers.length)
    const scale = (x) => x / total * width
    const style = (value, index) => {
      return {
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
  getRowMaps () {
    const {rubric, rubricFeedbacks} = this.props
    const { criteria, ratings } = rubric
    return criteria.map((crit) => {
      const cid = crit.id
      const rowMap = ratings.map((r, i) => {
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
  }

  render () {
    const {useRubric, rubricFeedbacks, rubric} = this.props
    const showRubric = rubric && useRubric && rubricFeedbacks && rubricFeedbacks.length > 0
    const { showLightbox } = this.state
    if (!showRubric) { return null }
    const rows = this.getRowMaps()
    return (
      <div className='rubric-summary' onClick={this.openLightBox.bind(this)}>
        { rows.map((r) => this.renderRubricRow(r)) }
        { showLightbox ? this.renderLightBox() : ''}
      </div>
    )
  }
}
