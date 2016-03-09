import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { connect } from 'react-redux'
import { setAnswerSelectedForCompare } from '../actions'

@pureRender
export class CompareAnswerCheckbox extends Component {
  render() {
    const { answer, onChange } = this.props
    return (
      <input type='checkbox' checked={answer.get('selectedForCompare')}
                             onChange={(e) => onChange(answer.get('key'), e.target.checked)}/>
    )
  }
}

export class CompareAnswerRmLink extends Component {
  render() {
    const { answer, onChange, children } = this.props
    return (
      <a onClick={(e) => onChange(answer.get('key'), false)}>{children}</a>
    )
  }
}

// AddLink would be simple too, but there is no use case for it yet.

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: (key, value) => dispatch(setAnswerSelectedForCompare(key, value))
  }
}

export const CompareAnswerCheckboxContainer = connect(null, mapDispatchToProps)(CompareAnswerCheckbox)
export const CompareAnswerRmLinkContainer = connect(null, mapDispatchToProps)(CompareAnswerRmLink)
