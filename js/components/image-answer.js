import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Modal } from 'react-bootstrap'

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
      <Modal show={this.state.lightboxActive} onHide={() => this.setState({lightboxActive: false})}>
        <Modal.Body>
          <img src={imgAnswer.get('imageUrl')}/>
        </Modal.Body>
        <Modal.Footer>
          <div style={{fontWeight: 'bold'}}>{answer.getIn(['student', 'name'])}</div>
          <div>{imgAnswer.get('note')}</div>
        </Modal.Footer>
      </Modal>
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
        {this.renderImageLightbox()}
      </div>
    )
  }
}
