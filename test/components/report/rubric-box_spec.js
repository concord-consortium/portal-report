import React from 'react'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { render } from 'enzyme'
import RubricBox from '../../../js/components/report/rubric-box'
import sampleRubric from '../../../public/sample-rubric'

describe('<RubricBox /> disabling non-applicable ratings', () => {
  it('should understand which rubric criteria are or are not applicable', () => {
    const rubric = sampleRubric;
    const rubricFeedback = {};
    const updateFeedback = () => { null; };
    const learnerId = "id3";
    const rubricBox = render(<RubricBox
      rubric={rubric}
      rubricFeedback={rubricFeedback}
      rubricChange={updateFeedback}
      learnerId={learnerId}
    />);
    // First, let's verify the input data for the test.
    expect(rubric.criteria[0].nonApplicableRatings[0]).to.equal("R2");
    // OK, since the input test data looks good, let's see if the rendered
    // rubricBox has just the one input control is disabled.
    expect(rubricBox.find("#C1-R1")[0].attribs.disabled).undefined
    expect(rubricBox.find("#C1-R2")[0].attribs.disabled).equals('')
    expect(rubricBox.find("#C1-R3")[0].attribs.disabled).undefined
  })
})

describe('<RubricBox /> converting markdown in description fields', () => {
  it('should convert to HTML', () => {
    const rubric = sampleRubric
    const rubricFeedback = {}
    const updateFeedback = () => null
    const learnerId = 'id3'
    const rubricBox = render(<RubricBox
      rubric={rubric}
      rubricFeedback={rubricFeedback}
      rubricChange={updateFeedback}
      learnerId={learnerId}
    />)

    // Verify the input rubric includes expected markdown:
    expect(rubric.criteria[0].description)
      .to.include('_**supported by evidence**_')

    // Verify the Markdown in our description gets converted to HTML tags:
    expect(rubricBox.find('tr#C1 td.description').html())
      .to.include('<em><strong>supported by evidence</strong></em>')
  })
})
