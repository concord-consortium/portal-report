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
    const imgAnswer = answer.get('answer')
    return (
      <Lightbox onOverlayClick={() => this.setState({lightboxActive: false})}>
        <img src={imgAnswer.get('imageUrl')}/>
        <div style={{color: '#fff', fontWeight: 'bold'}}>{answer.getIn(['student', 'name'])}</div>
        <div style={{color: '#fff'}}>{imgAnswer.get('note')}</div>
      </Lightbox>
    )
  }

  render() {
    const { answer } = this.props
    const imgAnswer = answer.get('answer')
    return (
      <div>
        <div className='image-answer'>
          <img src={imgAnswer.get('imageUrl')} onClick={() => this.setState({lightboxActive: true})}/>
          <div>{imgAnswer.get('note')}</div>
        </div>
        {this.state.lightboxActive ? this.renderImageLightbox() : ''}
      </div>
    )
  }
}
