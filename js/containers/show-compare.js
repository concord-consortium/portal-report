import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { showCompareView } from '../actions'
import Button from '../components/button'

export class ShowCompareButton extends PureComponent {
  render () {
    const { answer, onClick } = this.props
    return (
      <Button className='select-answer' onClick={() => onClick(answer.get('embeddableKey'))} disabled={!answer.get('selectedForCompare')}>
        Compare/project
      </Button>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: (embeddableKey) => dispatch(showCompareView(embeddableKey))
  }
}

const ShowCompareContainer = connect(null, mapDispatchToProps)(ShowCompareButton)
export default ShowCompareContainer
