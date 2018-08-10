import React, { PureComponent } from 'react'
import { Modal } from 'react-bootstrap'
import Button from '../common/button'
import css from '../../../css/dashboard/question-details.less'

export default class QuestionDetails extends PureComponent {
  render () {
    const { selectedQuestion, onClose } = this.props
    const prompt = selectedQuestion && selectedQuestion.get('prompt')
    return (
      <Modal
        show={selectedQuestion.size > 0}
        onHide={onClose}
        contentLabel='Example Modal'
      >
        <Modal.Header>
          <Button onClick={onClose}>
            Close
          </Button>
        </Modal.Header>
        <Modal.Body>
          <div className={css.question} dangerouslySetInnerHTML={{ __html: prompt }} />
        </Modal.Body>
      </Modal>
    )
  }
}
