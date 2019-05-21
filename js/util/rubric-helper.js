import { fromJS } from "immutable";

const NO_FEEDBACK = fromJS({});

// Some parts of Rubric are designed for student specifically.
// They use common suffix appended to the properties.
const VIEWER_SUFFIX = {
  teacher: "",
  student: "ForStudent",
};

const keyForViewer = (defaultKey, viewer) => `${defaultKey}${VIEWER_SUFFIX[viewer]}`;

export class RubricHelper {
  constructor(rubric, feedback) {
    this.rubric = fromJS(rubric);
    this.feedback = fromJS(feedback);
  }

  criteriaLabel(viewer = "teacher") {
    const defaultKey = "criteriaLabel";
    return this.rubric.get(keyForViewer(defaultKey, viewer)) || this.rubric.get(defaultKey);
  }

  feedbackLabel(viewer = "teacher") {
    // Actually, there's no feedbackLabel for teachers. But let's keep this pattern in case we want to add
    // it later and display somewhere.
    const defaultKey = "feedbackLabel";
    return this.rubric.get(keyForViewer(defaultKey, viewer)) || this.rubric.get(defaultKey);
  }

  ratingForId(ratingID) {
    return this.rubric.get("ratings").find(r => r.get("id") === ratingID);
  }

  feedbackRatingFor(criteria = "teacher") {
    const criteriaId = criteria.get("id");
    const feedback = this.feedback.get(criteriaId) || NO_FEEDBACK;
    const ratingId = feedback.get("id");
    return this.ratingForId(ratingId);
  }

  criteriaDescription(criteria, viewer = "teacher") {
    const defaultKey = "description";
    return criteria.get(keyForViewer(defaultKey, viewer)) || criteria.get(defaultKey);
  }

  feedbackDescriptionForCriteria(criteria, viewer = "teacher") {
    const rating = this.feedbackRatingFor(criteria);
    if (!rating) { return null; }
    const ratingId = rating.get("id");
    const defaultKey = "ratingDescriptions";
    const viewerDescription = criteria.getIn([keyForViewer(defaultKey, viewer), ratingId], null);
    const defaultDescription = criteria.getIn([defaultKey, ratingId], null);
    return viewerDescription || defaultDescription;
  }

  feedbackScoreForCriteria(criteria) {
    return this.feedbackRatingFor(criteria).get("score");
  }

  allFeedback(viewer = "teacher") {
    return this.rubric.get("criteria").map(c => {
      const record = this.feedbackRatingFor(c);
      if (!record) { return null; }
      return {
        description: this.criteriaDescription(c, viewer),
        ratingDescription: this.feedbackDescriptionForCriteria(c, viewer),
        score: record.get("score"),
        label: record.get("label"),
        key: c.get("id"),
      };
    }).toJS();
  }
}
