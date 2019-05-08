import React, { PureComponent } from 'react'
import RubricBox from '../report/rubric-box'
import FeedbackPanelForStudent from '../report/feedback-panel-for-student'
import SummaryIndicator from '../report/summary-indicator'
import sampleRubric from '../../../public/sample-rubric'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import RubricForm from './rubric-form'
import S3Upload from './s3-upload'

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
    this.handleJsonEditorChange = this.handleJsonEditorChange.bind(this)
    this.handleTabsChange = this.handleTabsChange.bind(this)
  }

  updateRubricFromJsonText (value) {
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

  handleJsonEditorChange (e) {
    const value = e.target.value
    this.updateRubricFromJsonText(value)
  }

  handleTabsChange (firstTab, lastTab) {
    if (lastTab === 0 && this.rubricFormRef) {
      // RubricForm tab has been just unselected -> trigger save.
      this.rubricFormRef.triggerSave()
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
      // Why forceRenderTabPanel?
      // Without it, every tab panel will be mounted when it's open and unmounted when it's closed.
      // It prevents tab content from having its own state.
      <Tabs className='full-width' forceRenderTabPanel onSelect={this.handleTabsChange}>
        <TabList>
          <Tab> Editor </Tab>
          <Tab> JSON </Tab>
          <Tab> Preview </Tab>
          <Tab> S3 Upload </Tab>
        </TabList>
        <TabPanel>
          <RubricForm ref={rf => { this.rubricFormRef = rf }} rubric={rubric} updateRubric={this.updateRubric} />
        </TabPanel>
        <TabPanel>
          JSON:
          <textarea
            className='json-editor'
            onChange={this.handleJsonEditorChange}
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
        <TabPanel>
          <S3Upload onLoad={this.updateRubricFromJsonText} resourceJSON={rubricText} />
        </TabPanel>
      </Tabs>
    )
  }
}

export default RubricTest
