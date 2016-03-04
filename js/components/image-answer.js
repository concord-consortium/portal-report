import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import Lightbox from './lightbox'
import StudentName from '../containers/student-name'

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
    const { answerJSON } = this.props
    return (
      <Lightbox onOverlayClick={() => this.setState({lightboxActive: false})}>
        <img src={answerJSON.answer.image_url}/>
        <div style={{color: '#fff', fontWeight: 'bold'}}><StudentName id={answerJSON.student_id}/></div>
        <div style={{color: '#fff'}}>{answerJSON.answer.note}</div>
      </Lightbox>
    )
  }

  render() {
    const { answerJSON } = this.props
    return (
      <div>
        <div className='image-answer'>
          <img src={answerJSON.answer.image_url} onClick={() => this.setState({lightboxActive: true})}/>
          <div>{answerJSON.answer.note}</div>
        </div>
        {this.state.lightboxActive ? this.renderImageLightbox() : ''}
      </div>
    )
  }
}
