import React, { PureComponent } from 'react'
import '../../../css/report/external-link.less'
export default class MaybeLink extends PureComponent {
  render () {
    const {children, url} = this.props
    const target = this.props.target || '_blank'
    if (url) {
      return <a href={url} target={target}>{children} <span className='pr-icon-external-link' /></a>
    }
    return children
  }
}
