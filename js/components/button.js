import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/button.less'

@pureRender
export default class Button extends Component {
  render() {
    const { onClick, children, className } = this.props
    return <a className={`cc-button ${className}`} onClick={onClick}>{children}</a>
  }
}

Button.defaultProps = {
  onClick: function () {}
}