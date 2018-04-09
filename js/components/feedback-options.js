import React, { PureComponent } from 'react' // eslint-disable-line
import { RadioGroup, Radio } from 'react-radio-group'
import ReactTooltip from 'react-tooltip'
import '../../css/feedback-panel.less'
import '../../css/tooltip.less'
import NumericTextField from './numeric-text-field'
import {
  NO_SCORE,
  MANUAL_SCORE_L,
  MANUAL_SCORE,
  AUTOMATIC_SCORE_L,
  AUTOMATIC_SCORE,
  MAX_SCORE_DEFAULT
} from '../util/scoring-constants'

export default class FeedbackOptions extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { lastScoreType: null }
    this.enableText = this.enableText.bind(this)
    this.enableRubric = this.enableRubric.bind(this)
    this.setMaxScore = this.setMaxScore.bind(this)
    this.changeScoreType = this.changeScoreType.bind(this)
  }

  enableText (event) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(
      activityId, {
        activityFeedbackId,
        enableTextFeedback: event.target.checked
      })
  }

  enableRubric (event) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(
      activityId, {
        activityFeedbackId,
        useRubric: event.target.checked
      })
  }

  setMaxScore (value) {
    const activityId = this.props.activity.get('id')
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    this.props.enableActivityFeedback(activityId, {
      activityFeedbackId,
      maxScore: value
    })
  }

  changeScoreType (newV) {
    const activityId = this.props.activity.get('id').toString()
    const activityFeedbackId = this.props.activity.get('activityFeedbackId')
    const newFlags = { activityFeedbackId, scoreType: newV }
    if (newV !== NO_SCORE) {
      this.setState({lastScoreType: newV})
    }
    if (newV === AUTOMATIC_SCORE) {
      newFlags.maxScore = this.props.computedMaxScore
    }
    this.props.enableActivityFeedback(activityId, newFlags)
  }

  render () {
    const { activity, computedMaxScore } = this.props
    const scoreType = activity.get('scoreType') || NO_SCORE
    const showText = activity.get('enableTextFeedback')
    const rubricUrl = activity.get('rubricUrl')
    const rubricAvailable = rubricUrl && rubricUrl.length > 0
    const useRubric = rubricAvailable && activity.get('useRubric')
    const scoreEnabled = scoreType !== NO_SCORE
    const maxScore = scoreType === 'auto'
      ? computedMaxScore
      : activity.get('maxScore')
    const scoreClassName = scoreEnabled
      ? 'enabled'
      : 'disabled'
    const toggleScoreEnabled = () => {
      if (scoreEnabled) {
        this.changeScoreType(NO_SCORE)
      } else {
        this.changeScoreType(this.state.lastScoreType || MANUAL_SCORE)
      }
    }

    return (
      <div className='feedback-options'>
        <input id='rubricEnabled'
          type='checkbox'
          checked={useRubric}
          disabled={!rubricAvailable}
          onChange={this.enableRubric} />
        <label
          disabled={!rubricAvailable}
          className={!rubricAvailable
            ? 'disabled'
            : ''}
          htmlFor='rubricEnabled'>

          Use rubric</label>
        <br />
        <input id='feedbackEnabled' type='checkbox' checked={showText} onChange={this.enableText} />
        <label htmlFor='feedbackEnabled'>Provide written feedback</label>
        <br />
        <input id='giveScore' name='giveScore' type='checkbox' checked={scoreEnabled} onChange={toggleScoreEnabled} />
        <label htmlFor='giveScore'>Give Score</label>
        <br />
        <div className={scoreClassName} style={{marginLeft: '1em'}}>
          <RadioGroup
            name='scoreType'
            selectedValue={scoreType}
            onChange={this.changeScoreType}
          >
            <div>
              <Radio value={MANUAL_SCORE} />
              <span
                className='tooltip'
                data-tip data-for='MANUAL_SCORE'>
                {MANUAL_SCORE_L}
              </span>
            </div>
            <div>
              <Radio value={AUTOMATIC_SCORE} />
              <span className='tooltip' data-tip data-for='AUTOMATIC_SCORE'>
                {AUTOMATIC_SCORE_L}
              </span>
            </div>

            <ReactTooltip
              id='NO_SCORE'
              place='top'
              type='dark'
              delayShow={500}>
                  No activity level score.
            </ReactTooltip>

            <ReactTooltip
              id='MANUAL_SCORE'
              place='top'
              type='dark'
              delayShow={500}>
                  Provide your own activity level score.
            </ReactTooltip>

            <ReactTooltip
              id='AUTOMATIC_SCORE'
              place='top'
              type='dark'
              delayShow={500}>
                Sum scores from individual questions.
            </ReactTooltip>
          </RadioGroup>

          { scoreType === MANUAL_SCORE
            ? <div>
              <label className='max-score'>Max. Score</label>
              <NumericTextField
                className='max-score-input'
                value={maxScore}
                default={MAX_SCORE_DEFAULT}
                onChange={this.setMaxScore} />
            </div>
            : <div>
              <label className='max-score disabled'>Max. Score</label>
              <input className='max-score-input disabled' disabled value={maxScore} />
            </div>
          }
        </div>
      </div>
    )
  }
}
