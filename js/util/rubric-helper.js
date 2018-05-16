import { fromJS } from 'immutable'

const NO_FEEDBACK = fromJS({})

// Some parts of Rubric are designed for student specifically.
// They use common suffix appended to the properties.
const VIEWER_SUFFIX = {
  teacher: '',
  student: 'ForStudent'
}

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
    const feedback = this.feedback.get(criteriaId) || NO_FEEDBACK
    const ratingId = feedback.get('id')
    return this.ratingForId(ratingId)
  }

  feedbackDescriptionForCriteria (criteria, viewer = 'teacher') {
    const rating = this.feedbackRatingFor(criteria)
    if (!rating) return null
    const ratingId = rating.get('id')
    const defaultKey = 'ratingDescriptions'
    const viewerKey = `${defaultKey}${VIEWER_SUFFIX[viewer]}`
    const viewerDescription = criteria.getIn([viewerKey, ratingId], null)
    const defaultDescription = criteria.getIn([defaultKey, ratingId], null)
    return viewerDescription || defaultDescription
  }

  feedbackScoreForCriteria (criteria) {
    return this.feedbackRatingFor(criteria).get('score')
  }

  allFeedback (viewer = 'teacher') {
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
