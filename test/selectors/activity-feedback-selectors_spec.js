
import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { fromJS } from 'immutable'
import {
  getStudentFeedbacks,
  getAutoscores
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
})
