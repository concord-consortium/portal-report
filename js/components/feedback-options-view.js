import React, { PureComponent } from 'react' // eslint-disable-line
import { RadioGroup, Radio } from 'react-radio-group'
import ReactTooltip from 'react-tooltip'
import '../../css/feedback-options.less'
import '../../css/tooltip.less'
import NumericTextField from './numeric-text-field'
import {
  MANUAL_SCORE,
  MANUAL_SCORE_L,
  AUTOMATIC_SCORE,
  AUTOMATIC_SCORE_L,
  RUBRIC_SCORE,
  RUBRIC_SCORE_L,
  MAX_SCORE_DEFAULT
} from '../util/scoring-constants'

export default class FeedbackOptionsView extends PureComponent {
  renderMaxScore () {
    const {scoreType, maxScore, setMaxScore} = this.props
    if (scoreType === MANUAL_SCORE) {
      return (
        <span>
          <label className='max-score'>Max. Score</label>
          <NumericTextField
            className='max-score-input'
            value={maxScore}
            default={MAX_SCORE_DEFAULT}
            onChange={setMaxScore}
          />
        </span>
      )
    }
    return (
      <span>
        <label className='max-score disabled'>Max. Score</label>
        <input className='max-score-input disabled' disabled value={maxScore} />
      </span>
    )
  }

  render () {
    const {
      useRubric,
      rubricAvailable,
      scoreEnabled,
      scoreType,
      enableRubric,
      enableText,
      toggleScoreEnabled,
      changeScoreType,
      showText
    } = this.props

    const scoreClassName = scoreEnabled
      ? 'enabled'
      : 'disabled'

    const writtenFeedbackLabel = 'Provide written feedback'
    const giveScoreLabel = 'Give Score'
    const renderToolTip = (id, text) => {
      return <ReactTooltip id={id} place='top' type='dark'delayShow={500}> {text} </ReactTooltip>
    }

    return (
      <div className='feedback-options'>
        <div className='main-options'>
          <input id='rubricEnabled'
            type='checkbox'
            checked={useRubric}
            disabled={!rubricAvailable}
            onChange={enableRubric}
          />

          <label
            disabled={!rubricAvailable}
            className={!rubricAvailable
              ? 'disabled'
              : ''}
            htmlFor='rubricEnabled'>
            Use rubric</label>
          <br />

          <input
            id='feedbackEnabled'
            type='checkbox'
            checked={showText}
            onChange={enableText}
          />
          <label htmlFor='feedbackEnabled'>{writtenFeedbackLabel}</label>
          <br />

          <input
            id='giveScore'
            name='giveScore'
            type='checkbox'
            checked={scoreEnabled}
            onChange={toggleScoreEnabled}
          />
          <label htmlFor='giveScore'>{giveScoreLabel}</label>
          <br />
        </div>
        <div className='score-options'>
          <div className={scoreClassName} style={{marginLeft: '1em'}}>
            <RadioGroup
              name='scoreType'
              selectedValue={scoreType}
              onChange={changeScoreType}
            >
              <div>
                <Radio value={MANUAL_SCORE} />
                <span className='tooltip' data-tip data-for='MANUAL_SCORE'>
                  {MANUAL_SCORE_L}
                </span>
                {this.renderMaxScore()}
              </div>

              <div>
                <Radio value={AUTOMATIC_SCORE} />
                <span className='tooltip' data-tip data-for='AUTOMATIC_SCORE'>
                  {AUTOMATIC_SCORE_L}
                </span>
              </div>
              { useRubric
                ? <div>
                  <Radio value={RUBRIC_SCORE} />
                  <span className='tooltip' data-tip data-for='RUBRIC_SCORE'>
                    {RUBRIC_SCORE_L}
                  </span>
                </div>
                : null
              }

              { renderToolTip('NO_SCORE', 'Provide your own activity level score.') }
              { renderToolTip('MANUAL_SCORE', 'No activity level score.') }
              { renderToolTip('RUBRIC_SCORE', 'Scores come from the rubric.') }
              { renderToolTip('AUTOMATIC_SCORE', 'Sum scores from individual questions.') }
            </RadioGroup>
          </div>
        </div>
      </div>
    )
  }
}
