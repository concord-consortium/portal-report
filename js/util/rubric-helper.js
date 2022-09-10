const NO_FEEDBACK = {};

// Some parts of Rubric are designed for student specifically.
// They use common suffix appended to the properties.
const VIEWER_SUFFIX = {
  teacher: "",
  student: "ForStudent",
};

const keyForViewer = (defaultKey, viewer) => `${defaultKey}${VIEWER_SUFFIX[viewer]}`;

export class RubricHelper {
  constructor(rubric, feedback) {
    this.rubric = rubric;
    this.feedback = feedback;
  }

  criteriaLabel(viewer = "teacher") {
    const defaultKey = "criteriaLabel";
    return this.rubric?.[keyForViewer(defaultKey, viewer)] || this.rubric?.[defaultKey];
  }

  feedbackLabel(viewer = "teacher") {
    // Actually, there's no feedbackLabel for teachers. But let's keep this pattern in case we want to add
    // it later and display somewhere.
    const defaultKey = "feedbackLabel";
    return this.rubric?.[keyForViewer(defaultKey, viewer)] || this.rubric?.[defaultKey];
  }

  ratingForId(ratingID) {
    return this.rubric?.ratings.find(r => r?.id === ratingID);
  }

  feedbackRatingFor(criteria = "teacher") {
    const criteriaId = criteria?.id;
    const feedback = this.feedback?.[criteriaId] || NO_FEEDBACK;
    const ratingId = feedback?.id;
    return this.ratingForId(ratingId);
  }

  criteriaDescription(criteria, viewer = "teacher") {
    const defaultKey = "description";
    return criteria?.[keyForViewer(defaultKey, viewer)] || criteria?.[defaultKey];
  }

  feedbackDescriptionForCriteria(criteria, viewer = "teacher") {
    const rating = this.feedbackRatingFor(criteria);
    if (!rating) { return null; }
    const ratingId = rating?.id;
    const defaultKey = "ratingDescriptions";
    const viewerDescription = criteria.getIn([keyForViewer(defaultKey, viewer), ratingId], null);
    const defaultDescription = criteria.getIn([defaultKey, ratingId], null);
    return viewerDescription || defaultDescription;
  }

  feedbackScoreForCriteria(criteria) {
    return this.feedbackRatingFor(criteria)?.score;
  }

  allFeedback(viewer = "teacher") {
    return this.rubric?.criteria.map(c => {
      const record = this.feedbackRatingFor(c);
      if (!record) { return null; }
      return {
        description: this.criteriaDescription(c, viewer),
        ratingDescription: this.feedbackDescriptionForCriteria(c, viewer),
        score: record?.score,
        label: record?.label,
        key: c?.id,
      };
    });
  }
}
