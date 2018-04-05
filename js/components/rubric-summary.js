import React, { PureComponent } from 'react'
import chroma from 'chroma-js'
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
    const { rubric } = this.props
    return (
      <div className='rubric-lightbox-wrapper'>
        <div className='rubric-lightbox'>
          <div className='closebox' onClick={this.closeLightBox.bind(this)}>✖</div>
          <div className='rubic-summary'>
            <RubricBox rubric={rubric} />
          </div>
        </div>
      </div>
    )
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

  render () {
    const {useRubric, rubricFeedbacks, rubric} = this.props
    const showRubric = useRubric && rubricFeedbacks && rubricFeedbacks.length > 0
    const { showLightbox } = this.state
    if (!showRubric) { return null }
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
      <div className='rubric-summary' onClick={this.openLightBox.bind(this)}>
        { rows.map((r) => this.renderRubricRow(r)) }
        { showLightbox ? this.renderLightBox() : ''}
      </div>
    )
  }
}
