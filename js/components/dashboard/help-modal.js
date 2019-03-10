import React, { PureComponent } from 'react'
import { Modal } from 'react-bootstrap'
import Button from '../../components/common/button'

import css from '../../../css/dashboard/help-modal.less'

export default class HelpModal extends PureComponent {

  render () {
    const { toggleHelpModal, helpViewVisible } = this.props
    return (
      <Modal show={helpViewVisible} onHide={toggleHelpModal}>
        <Modal.Body>
          <div className={css.helpContent}>
          <h2>Help</h2>
          <ul>
          <li className="icon"><i className="icomoon-checkmark correct" style={{color: '#2da343'}}></i> Correct Answer</li>
          <li className="icon"><i className="icomoon-checkmark incorrect" style={{color: '#ea6d2f'}}></i> Incorrect Answer</li>
          <li className="icon"><i className="icomoon-checkmark2"></i> Answer</li>
          <li className="icon"><i className="icomoon-file-text"></i> Open Response Answer</li>
          <li className="genericAnswer"><span style={{color: '#999'}}>⬤</span> Image Answer</li>
          <li className="questionPrompt"><span className="icomoon-expander"></span> Expand to view question and answer details</li>
          </ul>
          <p>The open/close students...</p>
          <p>Scrolling (two fingers on trackpad tip should be included)...</p>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className={css.closeButton}><Button onClick={toggleHelpModal}>close</Button></div>
        </Modal.Footer>
      </Modal>
    )
  }
}
