import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { render } from 'enzyme'
import RubricBox from '../../../js/components/report/rubric-box'
import sampleRubric from '../../../public/sample-rubric'

describe('<RubricBox /> disabling non-applicable ratings', () => {
  it('should understand which rubric criteria are or are not applicable', () => {
    const rubric = sampleRubric
    const rubricFeedback = {}
    const updateFeedback = () => { null; }
    const learnerId = 'id3'
    const rubricBox = render(<RubricBox
      rubric={rubric}
      rubricFeedback={rubricFeedback}
      rubricChange={updateFeedback}
      learnerId={learnerId}
    />)
    // First, let's verify the input data for the test.
    expect(rubric.criteria[0].nonApplicableRatings[0]).to.equal('R2')
    // OK, since the input test data looks good, let's see if the rendered
    // rubricBox has just the one input control is disabled.
    expect(rubricBox.find('input#C1-R1').length).to.equal(1)
    expect(rubricBox.find('input#C1-R2').length).to.equal(0)
    expect(rubricBox.find('#C1-R2').text()).to.equal('N/A')
    expect(rubricBox.find('input#C1-R3').length).to.equal(1)
  })
}) 
