import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { setAnswerSelectedForCompare } from '../actions'

@pureRender
export class SelectAnswerForCompareCheckbox extends Component {
  render() {
    const { answer, onChange } = this.props
    return (
      <input type='checkbox' checked={answer.get('selectedForCompare')}
                             onChange={(e) => onChange(answer.get('key'), e.target.checked)}/>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: (key, value) => dispatch(setAnswerSelectedForCompare(key, value))
  }
}

const SelectAnswerForCompare = connect(null, mapDispatchToProps)(SelectAnswerForCompareCheckbox)
export default SelectAnswerForCompare
