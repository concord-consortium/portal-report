import React, { PureComponent } from 'react'
import RubricBox from '../components/rubric-box'
import FeedbackPanelForStudent from '../components/feedback-panel-for-student'
import SummaryIndicator from '../components/summary-indicator'
const sampleRubric = {
  'id': 'RBK1',
  'formatVersion': '1.0.0',
  'version': '12',
  'updatedMsUTC': 1519424087822,
  'originUrl': 'http://concord.org/rubrics/RBK1.json',
  'scoreUsingPoints': false,
  'showRatingDescriptions': false,
  'criteria': [
    {
      'id': 'C1',
      'description': 'Use mathematical and/or computational representations to support explanations of factors that affect carrying capacity of ecosystems at different scales. ',
      'ratingDescriptions': {
        'R1': 'Not meeting expected goals.',
        'R2': 'Approaching proficiency.',
        'R3': 'Exhibiting proficiency.'
      }
    },
    {
      'id': 'C2',
      'description': 'Develop a model to illustrate the role of photosynthesis and cellular respiration in the cycling of carbon among the biosphere, atmosphere, hydrosphere, and geosphere.',
      'ratingDescriptions': {
        'R1': 'Not meeting expected goals.',
        'R2': 'Approaching proficiency.',
        'R3': 'Exhibiting proficiency.'
      }
    }
  ],
  'ratings': [
    {
      'id': 'R1',
      'label': 'Beginning',
      'score': 1
    },
    {
      'id': 'R2',
      'label': 'Developing',
      'score': 2
    },
    {
      'id': 'R3',
      'label': 'Proficient',
      'score': 3
    }
  ]
}
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
  console.dir(answers)
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
  }
  render () {
    const { learnerId, rubric, rubricFeedback, hasBug, rubricText } = this.state
    const updateFeedback = (rf) => {
      console.dir(rf)
      this.setState({rubricFeedback: rf})
    }
    const updateRubric = (e) => {
      const value = e.target.value
      console.dir(value)
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
            onChange={updateRubric}
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
