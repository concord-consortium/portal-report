import { fromJS } from 'immutable'

const noFeedback = fromJS({})

export class RubricHelper {
  constructor (rubric, feedback) {
    this.rubric = fromJS(rubric)
    this.feedback = fromJS(feedback)
  }

  criteriaForId (criteriaID) {
    this.rubric.get('criteria').find(c => c.get('id') === criteriaID)
  }

  ratingForId (ratingID) {
    return this.rubric.get('ratings').find(r => r.get('id') === ratingID)
  }

  feedbackRatingFor (criteria) {
    const criteriaId = criteria.get('id')
    const feedback = this.feedback.get(criteriaId) || noFeedback
    const ratingId = feedback.get('id')
    return this.ratingForId(ratingId)
  }

  feedbackDescriptionForCriteria (criteria, viewer = '') {
    const rating = this.feedbackRatingFor(criteria)
    if (!rating) return null
    const ratingId = rating.get('id')
    const defaultKey = 'ratingDescriptions'
    const viewerKey = `${defaultKey}_${viewer}`
    const viewerDescription = criteria.getIn([viewerKey, ratingId], null)
    const defaultDescription = criteria.getIn([defaultKey, ratingId], null)
    return viewerDescription || defaultDescription
  }

  feedbackScoreForCriteria (criteria) {
    return this.feedbackRatingFor(criteria).get('score')
  }

  allFeedback (viewer = '') {
    return this.rubric.get('criteria').map(c => {
      const record = this.feedbackRatingFor(c)
      if (!record) return null
      return {
        description: c.get('description'),
        ratingDescription: this.feedbackDescriptionForCriteria(c, viewer),
        score: record.get('score'),
        label: record.get('label'),
        key: record.get('id')
      }
    }).toJS()
  }
}
