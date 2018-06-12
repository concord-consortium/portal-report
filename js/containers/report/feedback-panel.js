import React, { PureComponent } from 'react' // eslint-disable-line
import ReactDom from 'react-dom'

import Button from '../../components/report/button'
import FeedbackFilter from '../../components/report/feedback-filter'
import FeedbackOverview from '../../components/report/feedback-overview'
import FeedbackRow from '../../components/report/feedback-row'
import FeedbackButton from '../../components/report/feedback-button'
import SummaryIndicator from '../../components/report/summary-indicator'
import FeedbackOptionsView from '../../components/report/feedback-options-view'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { updateFeedback, enableFeedback } from '../../actions/index'
import { MANUAL_SCORE } from '../../util/scoring-constants'
import '../../../css/report/feedback-panel.less'

class FeedbackPanel extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false
    }
    this.studentRowRefs = {}
    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this)
    this.makeShowAll = this.makeShowAll.bind(this)
    this.showFeedback = this.showFeedback.bind(this)
    this.hideFeedback = this.hideFeedback.bind(this)
    this.answerIsMarkedComplete = this.answerIsMarkedComplete.bind(this)
    this.enableText = this.enableText.bind(this)
    this.enableScore = this.enableScore.bind(this)
    this.setMaxScore = this.setMaxScore.bind(this)
    this.scrollStudentIntoView = this.scrollStudentIntoView.bind(this)
    this.studentRowRef = this.studentRowRef.bind(this)
  }

  makeOnlyNeedReview () {
    this.setState({ showOnlyNeedReview: true })
  }

  makeShowAll () {
    this.setState({ showOnlyNeedReview: false })
  }

  showFeedback () {
    this.setState({
      showFeedbackPanel: true
    })
  }

  hideFeedback () {
    this.setState({
      showFeedbackPanel: false
    })
  }

  answerIsMarkedComplete (answer) {
    const feedbackId = answer.get('feedbacks') && answer.get('feedbacks').last()
    const feedback = this.props.feedbacks.get(feedbackId)
    return feedback && feedback.get('hasBeenReviewed')
  }

  enableText (event) {
    this.props.enableFeedback(this.props.question.get('key'), { feedbackEnabled: event.target.checked })
  }

  enableScore (event) {
    this.props.enableFeedback(this.props.question.get('key'), { scoreEnabled: event.target.checked })
  }

  setMaxScore (value) {
    const {enableFeedback, question} = this.props
    if (enableFeedback) {
      enableFeedback(question.get('key'), { maxScore: value })
    }
  }

  studentRowRef (index) {
    return `student-row-${index}`
  }

  scrollStudentIntoView (eventProxy) {
    const index = eventProxy.target.value
    const ref = this.studentRowRef(index - 1)
    const itemComponent = this.studentRowRefs[ref]
    if (itemComponent) {
      const domNode = ReactDom.findDOMNode(itemComponent)
      domNode.scrollIntoView()
    }
  }

  renderGettingStarted () {
    return (
      <div className='getting-started'>
        <div className='explainer'>
          To start, choose the type of feedback you want to leave in the Feedback Type settings above.
        </div>
        <div className='arrow'>⤴</div>
      </div>
    )
  }

  render () {
    const { question, answers } = this.props
    const showing = this.state.showFeedbackPanel
    const prompt = question.get('prompt')
    const number = question.get('questionNumber')
    const realAnswers = answers.filter(a => a.get('type') !== 'NoAnswer')
    const needingFeedback = realAnswers.filter(a => !this.answerIsMarkedComplete(a))

    const filteredAnswers = this.state.showOnlyNeedReview ? needingFeedback : answers
    const scores = this.props.feedbacks
      .map(f => f.get('score'))
      .filter(f => f != null)
      .toArray()

    const numAnswers = realAnswers.count()
    const numNoAnswers = answers.count() - realAnswers.count()
    let numNeedsFeedback = needingFeedback.count()
    let numFeedbackGiven = numAnswers - numNeedsFeedback

    const scoreEnabled = question.get('scoreEnabled') || false
    const feedbackEnabled = question.get('feedbackEnabled') || false
    const maxScore = question.get('maxScore')
    const showGettingStarted = !scoreEnabled && !feedbackEnabled
    const studentsPulldown = filteredAnswers.map((a) => {
      return {
        realName: a.getIn(['student', 'realName']),
        id: a.getIn(['student', 'id']),
        answer: a
      }
    })

    if (!scoreEnabled && !feedbackEnabled) {
      numNeedsFeedback = 0
      numFeedbackGiven = 0
    }

    if (!showing) {
      return (
        <div className='feedback-container'>
          <FeedbackButton
            feedbackEnabled={feedbackEnabled || scoreEnabled}
            needsReviewCount={numNeedsFeedback}
            disabled={numAnswers < 1}
            showFeedback={this.showFeedback} />

          <SummaryIndicator
            scores={scores}
            showScore={numAnswers > 0 && scoreEnabled}
            maxScore={maxScore}
          />
        </div>)
    }
    return (
      <div className='feedback-container'>
        <div className='lightbox-background' />
        <div className='feedback-panel'>
          <h1>Feedback: Question {number}</h1>
          <div className='prompt' dangerouslySetInnerHTML={{ __html: prompt }} />
          <div className='feedback-header'>
            <FeedbackOverview
              numNoAnswers={numNoAnswers}
              numFeedbackGiven={numFeedbackGiven}
              numNeedsFeedback={numNeedsFeedback}
            />
            <FeedbackOptionsView
              useRubric={false}
              rubricAvailable={false}
              scoreEnabled={scoreEnabled}
              scoreType={MANUAL_SCORE}
              maxScore={maxScore}
              enableRubric={this.enableRubric}
              enableText={this.enableText}
              toggleScoreEnabled={this.enableScore}
              showText={feedbackEnabled}
              setMaxScore={this.setMaxScore}
            />
          </div>

          <div className='main-feedback'>
            <FeedbackFilter
              showOnlyNeedReview={this.state.showOnlyNeedReview}
              studentSelected={this.scrollStudentIntoView}
              makeOnlyNeedReview={this.makeOnlyNeedReview}
              students={studentsPulldown}
              makeShowAll={this.makeShowAll}
              disable={showGettingStarted}
            />

            <div className='feedback-rows-wrapper'>
              {showGettingStarted ? this.renderGettingStarted() : ''}
              <div className='feedback-for-students'>
                <ReactCSSTransitionGroup transitionName='answer' transitionEnterTimeout={400} transitionLeaveTimeout={300}>
                  {filteredAnswers.map((answer, i) =>
                    <FeedbackRow
                      answer={answer}
                      ref={(row) => { this.studentRowRefs[this.studentRowRef(i)] = row }}
                      key={answer.get('key')}
                      scoreEnabled={scoreEnabled}
                      feedbackEnabled={feedbackEnabled}
                      maxScore={maxScore}
                      feedbacks={this.props.feedbacks}
                      updateFeedback={this.props.updateFeedback}
                      showOnlyNeedsRiew={this.state.showOnlyNeedReview}
                    />
                  )}
                </ReactCSSTransitionGroup>
              </div>
            </div>
          </div>
          <div className='footer'>
            <Button onClick={this.hideFeedback}>Done</Button>
          </div>
        </div>
      </div>

    )
  }
}

function mapStateToProps (state) {
  return { feedbacks: state.get('feedbacks') }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFeedback: (answerKey, feedback) => dispatch(updateFeedback(answerKey, feedback)),
    enableFeedback: (embeddableKey, feedbackFlags) => dispatch(enableFeedback(embeddableKey, feedbackFlags))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackPanel)
