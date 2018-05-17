import React, { PureComponent } from 'react'
import RubricBox from '../components/rubric-box'
import FeedbackPanelForStudent from '../components/feedback-panel-for-student'
import SummaryIndicator from '../components/summary-indicator'
import sampleRubric from '../../public/sample-rubric'

const genRFeedbacks = (rubric, numAnswers) => {
  const ratings = rubric.ratings
  const pickRating = (id) => {
    return ratings[Math.floor(Math.random() * ratings.length)]
  }
  const answers = []

  for (let i = 0; i < numAnswers; i++) {
    const answer = {}
    rubric.criteria.forEach(c => {
      answer[c.id] = pickRating()
    })
    answers.push(answer)
  }
  return answers
}

class RubricTest extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      rubric: sampleRubric,
      rubricText: JSON.stringify(sampleRubric, null, '  '),
      learnerId: 'noah123',
      rubricFeedback: {},
      hasBug: false
    }
    this.updateRubric = this.updateRubric.bind(this)
  }

  updateRubric (e) {
    const value = e.target.value
    this.setState({rubricText: value})
    try {
      const newRubric = JSON.parse(value)
      if (newRubric) {
        this.setState({rubric: newRubric, hasBug: false})
      }
    } catch (e) {
      console.error(e)
      this.setState({hasBug: true})
    }
  }

  render () {
    const { learnerId, rubric, rubricFeedback, hasBug, rubricText } = this.state
    const updateFeedback = (rf) => {
      this.setState({rubricFeedback: rf})
    }
    const style = {
      display: 'flex',
      flexDirection: 'row'
    }
    return (
      <div style={style}>
        <div style={{
          backgroundColor: hasBug ? 'hsl(0,30%,50%)' : 'white',
          padding: '1em'
        }}>
          <textarea
            style={{ width: '50vw', height: '50vh', fontSize: '12pt', fontFamily: 'monospace' }}
            onChange={this.updateRubric}
            value={rubricText} />
        </div>
        <div>
          <RubricBox
            rubric={rubric}
            rubricFeedback={rubricFeedback}
            rubricChange={updateFeedback}
            learnerId={learnerId} />
          <FeedbackPanelForStudent
            textFeedback='Great work!'
            score={10}
            maxScore={10}
            rubricFeedback={rubricFeedback}
            rubric={rubric}
            hasBeenReviewed
            showScore
            useRubric
            showText
          />
          <SummaryIndicator
            scores={[1, 4, 3, 4, 0, 2]}
            maxScore={10}
            rubricFeedbacks={genRFeedbacks(rubric, 10)}
            rubric={rubric}
            useRubric
          />
        </div>
      </div>
    )
  }
}

export default RubricTest
