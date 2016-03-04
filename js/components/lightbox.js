import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import '../../css/lightbox.less'

@pureRender
export default class Lightbox extends Component {
  render() {
    const { children, onOverlayClick } = this.props
    return (
      <div className='lightbox-overlay' onClick={() => onOverlayClick()}>
        <div className='lightbox-close'>X</div>
        <div className='lightbox-content' onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )
  }
}
