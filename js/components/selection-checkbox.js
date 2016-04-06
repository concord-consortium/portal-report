import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Answer from './answer'

import '../../css/question.less'

@pureRender
export default class SelectionCheckbox extends Component {
  constructor(props) {
    super(props)
  }


  onChange(evt) {
    const {questionKey, onSelectChange} = this.props
    onSelectChange(questionKey, evt.target.checked)
  }

  render() {
    const { selected, hideControls } = this.props
    if (hideControls) {
      return null
    }
    return(<input type='checkbox' checked={selected} onChange={this.onChange.bind(this)}/>)
  }
}
