import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Lightbox from './lightbox'

import '../../css/image-answer.less'

@pureRender
export default class ImageAnswer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lightboxActive: false
    }
  }

  renderImageLightbox() {
    const { answer } = this.props
    return (
      <Lightbox onOverlayClick={() => this.setState({lightboxActive: false})}>
        <img src={answer.answer.imageUrl}/>
        <div style={{color: '#fff', fontWeight: 'bold'}}>{answer.student.name}</div>
        <div style={{color: '#fff'}}>{answer.answer.note}</div>
      </Lightbox>
    )
  }

  render() {
    const { answer } = this.props
    return (
      <div>
        <div className='image-answer'>
          <img src={answer.answer.imageUrl} onClick={() => this.setState({lightboxActive: true})}/>
          <div>{answer.answer.note}</div>
        </div>
        {this.state.lightboxActive ? this.renderImageLightbox() : ''}
      </div>
    )
  }
}
