import React, { PureComponent } from 'react'
import { Modal } from 'react-bootstrap'
import Button from '../../components/common/button'

export default class HelpModal extends PureComponent {

  render () {
    const { toggleHelpModal, helpViewVisible } = this.props
    return (
      <Modal show={helpViewVisible} onHide={toggleHelpModal}>
        <Modal.Body>
          <div class="help-content">
          <h2>Help</h2>
          <div className="icon"><i className="icomoon-checkmark correct" style={{color: '#2da343'}}></i> Correct Answer</div>
          <div className="icon"><i className="icomoon-checkmark incorrect" style={{color: '#ea6d2f'}}></i> Incorrect Answer</div>
          <div className="icon"><i className="icomoon-checkmark2"></i> Answer</div>
          <div className="icon"><i className="icomoon-file-text"></i> Open Response Answer</div>
          <div className="genericAnswer" style={{color: '#999'}}>⬤ Image Answer</div>
          <div className="questionPrompt"><span className="icomoon-expander"></span> Expand to view question and answer details</div>
          <p>The open/close students...</p>
          <p>Scrolling (two fingers on trackpad tip should be included)...</p>
          <Button onClick={toggleHelpModal}>Close</Button>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}
