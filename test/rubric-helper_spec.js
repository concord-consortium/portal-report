import { expect } from 'chai'
import { describe, it } from 'mocha'
import { fromJS } from 'immutable'
import fs from 'fs'
import { RubricHelper } from '../js/util/rubric-helper'
const exampleRubricPath = './public/sample-rubric.json'
const exampleFeedbackPath = './public/sample-rubric-feedback.json'

describe('the rubric helper class', () => {
  const rubric = JSON.parse(fs.readFileSync(exampleRubricPath))
  const feedback = JSON.parse(fs.readFileSync(exampleFeedbackPath))
  const helper = new RubricHelper(rubric, feedback)

  it('Should read the example rubric', () => {
    expect(rubric).to.have.property('criteria')
  })
  it('Should read the example feedback', () => {
    expect(feedback).to.have.property('C1')
  })

  describe('scoreFor', () => {
    it('should  return the correct scores', () => {
      const criteria = fromJS(rubric.criteria[0])
      expect(helper.feedbackScoreForCriteria(criteria)).to.eql(3)
    })
  })

  describe('descriptionFor', () => {
    describe('when there is no student description', () => {
      it('should always return the default description', () => {
        const criteria = fromJS(rubric.criteria[0])
        const expected = 'Student makes a claim supported by evidence that indicates the pattern of impact on both ladybugs and aphids when the population of fire ants changes.'

        const defaultDesc = helper.feedbackDescriptionForCriteria(criteria)
        expect(defaultDesc).to.equal(expected)

        const studentDesc = helper.feedbackDescriptionForCriteria(criteria, 'student')
        expect(studentDesc).to.equal(expected)
      })
    })

    describe('when there is a student description', () => {
      it('should return the specific description for students when asked', () => {
        const criteria = fromJS(rubric.criteria[1])

        const defaultText = 'Student provides reasoning that describes predator-prey OR mutually beneficial interactions between fire ants/ladybugs and fire ants/aphids, respectively.'

        const studentText = 'Student Specific: R2'

        const defaultDesc = helper.feedbackDescriptionForCriteria(criteria)
        expect(defaultDesc).to.equal(defaultText)

        const studentDesc = helper.feedbackDescriptionForCriteria(criteria, 'student')
        expect(studentDesc).to.equal(studentText)
      })
    })
  })

  describe('allFeedback', () => {
    it('returns an object with all feedback values', () => {
      const data = helper.allFeedback('student')
      const record2 = data[1]
      expect(record2.ratingDescription).to.eql('Student Specific: R2')
      expect(record2.score).to.eql(2)
      expect(record2.label).to.eql('Developing')
      expect(record2.key).to.eql('R2')
    })
    describe('with no actual feedback …', () => {
      it('should not return anything', () => {
        const badHelper = new RubricHelper(rubric, {})
        const data = badHelper.allFeedback('student')
        const record2 = data[1]
        expect(record2).to.be.null
      })
    })
  })

})
