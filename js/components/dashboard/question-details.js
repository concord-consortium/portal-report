import React, { PureComponent } from 'react'
import { Modal } from 'react-bootstrap'
import Button from '../common/button'
import ReportQuestionDetails from '../report/question-details'
import AnswersTable from '../../containers/report/answers-table'
import css from '../../../css/dashboard/question-details.less'

export default class QuestionDetails extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      answersVisible: false
    }
    this.toggleAnswersVisibility = this.toggleAnswersVisibility.bind(this)
  }

  toggleAnswersVisibility () {
    this.setState({answersVisible: !this.state.answersVisible})
  }
  render () {
    const { selectedQuestion, onClose } = this.props
    const { answersVisible } = this.state
    const answers = selectedQuestion && selectedQuestion.get('answers')
      ? selectedQuestion.get('answers').sortBy(a =>
        (a.getIn(['student', 'lastName']) + a.getIn(['student', 'firstName'])).toLowerCase())
      : []
    const prompt = selectedQuestion && selectedQuestion.get('prompt')
    return (
      <Modal
        show={selectedQuestion.size > 0}
        onHide={onClose}
      >
        <Modal.Body>
          <div
            className={css.question} >
            <div dangerouslySetInnerHTML={{ __html: prompt }} />
            <ReportQuestionDetails question={selectedQuestion} />
            <Button onClick={this.toggleAnswersVisibility}>
              {answersVisible ? 'Hide responses' : 'Show responses'}
            </Button>
            {answersVisible ? <AnswersTable question={selectedQuestion} answers={answers} showCompare={false} /> : ''}
          </div>
        </Modal.Body>
        <Modal.Footer style={{display: 'flex', justifyContent: 'center'}}>
          <Button onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
