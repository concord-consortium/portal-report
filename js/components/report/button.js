import React, { PureComponent } from 'react'

import '../../../css/report/button.less'

export default class Button extends PureComponent {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    const { onClick, disabled } = this.props
    if (disabled) return
    onClick(event)
  }

  get className () {
    const { className, disabled } = this.props
    return `cc-button ${className} ${disabled ? 'disabled' : ''}`
  }

  render () {
    const { children } = this.props
    return <a className={this.className} onClick={this.handleClick}>{children}</a>
  }
}

Button.defaultProps = {
  onClick: function () {}
}
