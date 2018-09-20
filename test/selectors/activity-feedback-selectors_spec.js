
import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { fromJS } from 'immutable'
import {
  getStudentFeedbacks,
  getAutoscores,
  getRubricScores
} from '../../js/selectors/activity-feedback-selectors'

describe('activity-feedback-selectors', () => {
  let students = fromJS(
    [
      {
        lastName: 'Paessel',
        firstName: 'Noah',
        id: 1,
        realName: 'Noah Paessel',
        startedOffering: true
      },
      {
        lastName: 'Ada',
        firstName: 'Noah',
        id: 2,
        realName: 'Ada Paessel',
        startedOffering: true
      }
    ]
  )

  let activity = fromJS(
    {
      id: 1,
      activityFeedbackId: 1,
      activityFeedback: ['1-1', '1-2'],
      scoreType: 'manual'
    }
  )

  let activityFeedbacks = fromJS(
    {
      '1-1': {
        key: '1-1',
        studentId: 1,
        learnerId: 201,
        feedbacks: [
          {
            feedback: 'good',
            hasBeenReviewed: true,
            rubricFeedback: {
              C1: {
                description: 'Not meeting expected goals.',
                id: 'R1',
                label: 'Beginning',
                score: 1
              },
              C2: {
                description: 'Not meeting expected goals.',
                id: 'R1',
                label: 'Beginning',
                score: 1
              }
            },
            score: 1
          }
        ]
      },
      '1-2': {
        key: '1-2',
        studentId: 2,
        learnerId: 202,
        feedbacks: [
          {
            feedback: 'better',
            hasBeenReviewed: true,
            rubricFeedback: {
              C1: {
                description: 'better',
                id: 'R1',
                label: 'better',
                score: 2
              },
              C2: {
                description: 'better',
                id: 'R1',
                label: 'better',
                score: 2
              }
            },
            score: 2
          }
        ]
      }
    }
  )

  describe('getStudentFeedbacks', () => {
    it('should be a function', () => {
      expect(getStudentFeedbacks).to.be.a('function')
    })

    describe('with two complete answers', () => {
      let studentFeedbacks = null
      beforeEach(() => {
        studentFeedbacks = getStudentFeedbacks(
          activity,
          students,
          activityFeedbacks
        )
      })
      it('should have two scores', () => {
        expect(studentFeedbacks.scores)
          .to
          .have
          .members([1, 2])
      })
      describe('with one answer not reviewed', () => {
        beforeEach(() => {
          studentFeedbacks = getStudentFeedbacks(
            activity,
            students,
            activityFeedbacks.setIn(['1-2', 'feedbacks', '0', 'hasBeenReviewed'], false)
          )
        })
        it('should have one score', () => {
          expect(studentFeedbacks.scores)
            .to
            .have
            .members([1])
        })
      })
    })
  })

  describe('getAutoscores', () => {
    let scoreType = 'auto'
    let rubricScores = fromJS({1: 10, 2: 20})
    let questionAutoScores = fromJS({1: 1, 2: 2})
    let autoScores = null
    describe('with auto scoreType', () => {
      beforeEach(() => {
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores)
      })
      it('should return the questionAutoScores', () => {
        scoreType = 'auto'
        expect(autoScores).to.eql(questionAutoScores)
      })
    })
    describe('with rubric scoreType', () => {
      beforeEach(() => {
        scoreType = 'rubric'
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores)
      })
      it('should return the questionAutoScores', () => {
        expect(autoScores).to.eql(rubricScores)
      })
    })
    describe('with manual scoreType', () => {
      beforeEach(() => {
        scoreType = 'manual'
        autoScores = getAutoscores(scoreType, rubricScores, questionAutoScores)
      })
      it('should return the autoScores', () => {
        expect(autoScores).to.eql(questionAutoScores)
      })
    })
  })

  describe('getRubricScores', () => {
    // The rubric we are using to score with …
    let rubricDef = {
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
          'description': 'description',
          'ratingDescriptions': {
            'R1': 'Not meeting expected goals.',
            'R2': 'Approaching proficiency.',
            'R3': 'Exhibiting proficiency.'
          }
        },
        {
          'id': 'C2',
          'description': 'description',
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

    let feedbacks = {feedbacks: fromJS({
      '1-1': {
        key: '1-1',
        studentId: 1,
        learnerId: 201,
        // Most recent items are delivered first from the portal.
        feedbacks: [
          {
            feedback: 'second answer',
            hasBeenReviewed: true,
            rubricFeedback: {
              C1: {
                description: 'Not meeting expected goals.',
                id: 'R1',
                label: 'Beginning',
                score: 1
              },
              C2: {
                description: 'Not meeting expected goals.',
                id: 'R1',
                label: 'Beginning',
                score: 1
              }
            }
          }, {
            feedback: 'first answer',
            hasBeenReviewed: true,
            rubricFeedback: {
              C1: {
                description: 'Not meeting expected goals.',
                id: 'R2',
                label: 'Beginning',
                score: 3
              },
              C2: {
                description: 'Not meeting expected goals.',
                id: 'R2',
                label: 'Beginning',
                score: 3
              }
            },
            score: 1
          }
        ]
      }
    })}
    // the collection of feedbacks …
    let scores = null

    beforeEach(() => {
      scores = getRubricScores(rubricDef, feedbacks)
    })

    it('Should return the score from the most recent rubric feedback', () => {
      expect(scores.get(1)).to.eql(2)
    })
  })
})
