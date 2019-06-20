import React, { PureComponent } from 'react'

export default class SelectionCheckbox extends PureComponent {
  onChange (evt) {
    const {questionKey, setQuestionSelected} = this.props
    setQuestionSelected(questionKey, evt.target.checked)
  }

  render () {
    const {selected, hideControls} = this.props
    if (hideControls) {
      return null
    }
    return (<input type='checkbox' checked={selected} onChange={this.onChange.bind(this)} data-cy="checkbox"/>)
  }
}
