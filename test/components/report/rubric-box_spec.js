import React from 'react'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'mocha'
import { render } from 'enzyme'
import RubricBox from '../../../js/components/report/rubric-box'
import sampleRubric from '../../../public/sample-rubric'

describe('<RubricBox />', () => {
  let rubricBox
  beforeEach('', () => {
    const rubricFeedback = {}
    const updateFeedback = () => { null }
    const learnerId = 'id3'
    rubricBox = render(<RubricBox
      rubric={sampleRubric}
      rubricFeedback={rubricFeedback}
      rubricChange={updateFeedback}
      learnerId={learnerId}
    />)
  })

  describe('disabling non-applicable ratings', () => {
    it('should understand which rubric criteria are or are not applicable', () => {
      // First, let's verify the input data for the test.
      expect(sampleRubric.criteria[0].nonApplicableRatings[0]).to.equal('R2')
      // OK, since the input test data looks good, let's see if the rendered
      // rubricBox has just the one input control is disabled.
      expect(rubricBox.find('input#C1-R1').length).to.equal(1)
      expect(rubricBox.find('input#C1-R2').length).to.equal(0)
      expect(rubricBox.find('#C1-R2').text()).to.equal('N/A')
      expect(rubricBox.find('input#C1-R3').length).to.equal(1)
    })
  })

  describe('converting markdown in description fields', () => {
    it('should convert to HTML', () => {
      // Verify the input rubric includes expected markdown:
      expect(sampleRubric.criteria[0].description)
        .to.include('_**supported by evidence**_')

      // Verify the Markdown in our description gets converted to HTML tags:
      expect(rubricBox.find('tr#C1 td.description').html())
        .to.include('<em><strong>supported by evidence</strong></em>')
    })
  })
})
