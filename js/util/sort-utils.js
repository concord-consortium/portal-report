import { SORT_BY_LEAST_PROGRESS } from "../actions/dashboard";
import { compareStudentsByName } from "./misc";

const kSortGroupFirst = 1;
const kSortGroupSecond = 2;
const kSortGroupThird = 3;

export const sortByName = (students) => {
  return students.toList().sort((student1, student2) =>
    compareStudentsByName(student1, student2)
  );
};

export const sortByProgress = (students, studentProgress, sortBy) => {
  return students.toList().sort((student1, student2) => {
    const student1Progress = studentProgress.get(student1.get("id"));
    const student2Progress = studentProgress.get(student2.get("id"));
    const progressComp = sortBy === SORT_BY_LEAST_PROGRESS
      ? student1Progress - student2Progress
      : student2Progress - student1Progress;
    if (progressComp !== 0) {
      return progressComp;
    } else {
      return compareStudentsByName(student1, student2);
    }
  });
};

const hasFeedback = (feedbacks, studentId, feedbackLevelKey, targetId) => {
  const feedback = feedbacks.find(f =>
    f.get("platformStudentId") === studentId && f.get(feedbackLevelKey) === targetId
  );

  return !!feedback?.get("existingFeedbackSinceLastSort");
};

const groupAndCompareFeedback = (student1Progress, student1HasFeedback, student2Progress, student2HasFeedback) => {
  const group = (progress, hasFeedback) => {
    if (progress === 0) {
      return kSortGroupThird;
    } else if (hasFeedback) {
      return kSortGroupSecond;
    } else {
      return kSortGroupFirst;
    }
  };

  const student1SortGroup = group(student1Progress, student1HasFeedback);
  const student2SortGroup = group(student2Progress, student2HasFeedback);
  return student1SortGroup === student2SortGroup ? 0 : student1SortGroup > student2SortGroup ? 1 : -1;
};

export const sortByActivityFeedbackProgress = (students, feedback, studentProgressByActivity, currentActivity, firstActivity) => {
  const currentActivityId = currentActivity ? currentActivity.get("id") : firstActivity.get("id");
  const feedbacks = feedback.get("activityFeedbacks");

  return students.toList().sort((student1, student2) => {
    const student1Progress = studentProgressByActivity.getIn([student1.get("id"), currentActivityId]);
    const student2Progress = studentProgressByActivity.getIn([student2.get("id"), currentActivityId]);
    const student1HasFeedback = hasFeedback(feedbacks, student1.get("id"), "activityId", currentActivityId);
    const student2HasFeedback = hasFeedback(feedbacks, student2.get("id"), "activityId", currentActivityId);
    const feedbackComp = groupAndCompareFeedback(
      student1Progress, student1HasFeedback,
      student2Progress, student2HasFeedback
    );
    return feedbackComp;
  });
};

export const sortByQuestionFeedbackProgress = (students, feedback, currentQuestion, firstQuestion, answers) => {
  const question = currentQuestion || firstQuestion;
  const questionId = question.get("id");
  const feedbacks = feedback.get("questionFeedbacks");

  return students.toList().sort((student1, student2) => {
    const student1Answer = answers.getIn([questionId, student1.get("id")]);
    const student2Answer = answers.getIn([questionId, student2.get("id")]);
    const student1Progress = student1Answer && (!question.get("required") || student1Answer.get("submitted"));
    const student2Progress = student2Answer && (!question.get("required") || student2Answer.get("submitted"));
    const student1HasFeedback = hasFeedback(feedbacks, student1.get("id"), "questionId", questionId);
    const student2HasFeedback = hasFeedback(feedbacks, student2.get("id"), "questionId", questionId);
    const feedbackComp = groupAndCompareFeedback(
      student1Progress, student1HasFeedback,
      student2Progress, student2HasFeedback
    );
    return feedbackComp;
  });
};
