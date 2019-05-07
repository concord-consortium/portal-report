import React, { PureComponent } from 'react'
import RubricBox from '../../components/report/rubric-box'
import FeedbackPanelForStudent from '../../components/report/feedback-panel-for-student'
import SummaryIndicator from '../../components/report/summary-indicator'
import sampleRubric from '../../../public/sample-rubric'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import RubricForm from './rubric-form'

import 'react-tabs/style/react-tabs.css'
import '../../../css/authoring/tabs.css'

const genRFeedbacks = (rubric, numAnswers) => {
  const {criteria, ratings} = rubric
  if (!(criteria && ratings)) { return '' }
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
    this.updateRubricFromJsonText = this.updateRubricFromJsonText.bind(this)
  }

  updateRubricFromJsonText (e) {
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

  updateRubric (newValues) {
    this.setState(
      {
        rubric: newValues,
        hasBug: false
      }
    )
  }

  render () {
    const { learnerId, rubric, rubricFeedback } = this.state
    const updateFeedback = (rf) => {
      this.setState({rubricFeedback: rf})
    }
    const rubricText = JSON.stringify(rubric, null, '  ')
    return (
      <Tabs className='full-width'>
        <TabList>
          <Tab> Editor </Tab>
          <Tab> JSON </Tab>
          <Tab> Preview </Tab>
        </TabList>
        <TabPanel>
          <RubricForm rubric={rubric} updateRubric={this.updateRubric} />
        </TabPanel>
        <TabPanel>
          JSON:
          <textarea
            className='json-editor'
            onChange={this.updateRubricFromJsonText}
            value={rubricText}
          />
        </TabPanel>
        <TabPanel>
          <div className='preview'>
            <RubricBox
              rubric={rubric}
              rubricFeedback={rubricFeedback}
              rubricChange={updateFeedback}
              learnerId={learnerId} />
            <div>
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
        </TabPanel>
      </Tabs>
    )
  }
}

export default RubricTest
