import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import { Modal } from 'react-bootstrap'

@pureRender
export default class ImageAnswerModal extends Component {
  render() {
    const { answer, show, onHide } = this.props
    if (!answer) return null
    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Body>
          <img src={answer.getIn(['answer', 'imageUrl'])} style={{display: 'block', margin: '0 auto'}}/>
        </Modal.Body>
        <Modal.Footer>
          <div style={{fontWeight: 'bold'}}>{answer.getIn(['student', 'name'])}</div>
          <div>{answer.getIn(['answer', 'note'])}</div>
        </Modal.Footer>
      </Modal>
    )
  }
}
