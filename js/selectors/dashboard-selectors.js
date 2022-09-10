import { createSelector } from "reselect";
import { getActivityTrees, getQuestionTrees, getAnswersByQuestion } from "./report-tree";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS,
         SORT_BY_FEEDBACK_NAME, SORT_BY_FEEDBACK_PROGRESS } from "../actions/dashboard";
import { compareStudentsByName } from "../util/misc";

const kSortGroupFirst = 1;
const kSortGroupSecond = 2;
const kSortGroupThird = 3;

// Inputs
const getActivities = state => state?.report?.activities;
export const getAnonymous = state => state?.report?.anonymous;
const getCurrentActivityId = state => state?.dashboard?.currentActivityId;
const getQuestions = state => state?.report?.questions;
const getCurrentQuestionId = state => state?.dashboard?.currentQuestionId;
export const getCurrentStudentId = state => state?.dashboard?.currentStudentId;
const getStudents = state => state?.report?.students;
const getFeedback = state => state?.feedback;
export const getDashboardSortBy = state => state?.dashboard?.sortBy;
export const getDashboardFeedbackSortBy = state => state?.dashboard?.feedbackSortBy;
const getSeletedQuestionId = state => state?.dashboard?.selectedQuestion;
export const getCompactReport = state => state?.dashboard?.compactReport;
export const getHideFeedbackBadges = state => state?.dashboard?.hideFeedbackBadges;
export const getfeedbackSortRefreshEnabled = state => state?.dashboard?.feedbackSortRefreshEnabled;

// When a user selects a to display question details by
// Clicking on the question column expand icon.
export const getSelectedQuestion = createSelector(
  [getQuestionTrees, getSeletedQuestionId],
  (questions, id) => {
    if (questions && id) {
      return questions?.[id.toString()] ?? {};
    }
    return null;
  },
);

// Selectors

// Returns following hash:
// {
//   <student_id_1>: {
//     <activity_id_1>: 0.8,
//     <activity_id_2>: 0.45,
//     (...)
//   },
//   <student_id_1>: {
//     <activity_id_1>: 0.15,
//     <activity_id_2>: 0.8,
//     (...)
//   },
//   (...)
// }

function countCompletedAnswers(activityQuestions, answers, student) {
  return activityQuestions.reduce((count, question) => {
    const answer = answers?.[question?.id]?.[student?.id];
    if (answer &&
      // If question is required, its answer must be submitted.
      (!question?.required || answer?.submitted === true)) {
      return count + 1;
    } else {
      return count;
    }
  // start the counter off at 0
  }, 0);
}

export const getStudentProgress = createSelector(
  [ getStudents, getActivityTrees, getAnswersByQuestion ],
  (students, activities, answers) => {
    return students.map(student =>
      activities.map(activity => {
        const activityQuestions = activity?.questions.filter(q => q?.visible);

        return countCompletedAnswers(activityQuestions, answers, student) /
          activityQuestions.size;
      }),
    );
  },
);

// Returns a mapping from student IDs to their average progress across all activities
export const getStudentAverageProgress = createSelector(
  [ getStudents, getStudentProgress ],
  (students, studentProgress) => {
    return students.map(student => {
      const activitiesProgress = studentProgress?.[student.get("id")].toList();
      return activitiesProgress.reduce((sum, progress) => sum + progress) / activitiesProgress.size;
    });
  },
);

export const getCurrentActivity = createSelector(
  [ getActivities, getCurrentActivityId ],
  (activities, currentActivityId) => {
    return activities.find(activity => activity?.id === currentActivityId);
  }
);

export const getFirstActivity = createSelector(
  [ getActivities ],
  (activities) => {
    return activities.first();
  }
);

export const getCurrentQuestion = createSelector(
  [ getQuestions, getCurrentQuestionId ],
  (questions, currentQuestionId) => {
    return questions.find(activity => activity?.id === currentQuestionId);
  }
);

export const getFirstQuestion = createSelector(
  [ getQuestions ],
  (questions) => {
    return questions.first();
  }
);

// Returns sorted students
export const getSortedStudents = createSelector(
  [ getStudents, getDashboardSortBy, getStudentAverageProgress ],
  (students, sortBy, studentProgress) => {
    switch (sortBy) {
      case SORT_BY_NAME:
        return students.toList().sort((student1, student2) =>
          compareStudentsByName(student1, student2),
        );
      case SORT_BY_LEAST_PROGRESS:
      case SORT_BY_MOST_PROGRESS:
        return students.toList().sort((student1, student2) => {
          const student1Progress = studentProgress?.[student1.get("id")];
          const student2Progress = studentProgress?.[student2.get("id")];
          const progressComp = sortBy === SORT_BY_LEAST_PROGRESS
            ? student1Progress - student2Progress
            : student2Progress - student1Progress;
          if (progressComp !== 0) {
            return progressComp;
          } else {
            return compareStudentsByName(student1, student2);
          }
        });
      default:
        return students.toList();
    }
  },
);

// Returns sorted students in activity feedback view
export const getActivityFeedbackSortedStudents = createSelector(
  [ getStudents, getDashboardFeedbackSortBy, getFeedback, getStudentProgress, getCurrentActivity, getFirstActivity ],
  (students, feedbackSortBy, feedback, studentProgress, currentActivity, firstActivity) => {
    switch (feedbackSortBy) {
      case SORT_BY_FEEDBACK_NAME:
        return students.toList().sort((student1, student2) =>
          compareStudentsByName(student1, student2),
        );
      case SORT_BY_FEEDBACK_PROGRESS:
        return students.toList().sort((student1, student2) => {
          const activityFeedbacks = feedback?.activityFeedbacks;
          const currentActivityId = currentActivity ? currentActivity?.id : firstActivity?.id;
          const student1Feedback = activityFeedbacks.find(function(f) { return f?.platformStudentId === student1?.id
                                                                          && f?.activityId === currentActivityId; });
          const student2Feedback = activityFeedbacks.find(function(f) { return f?.platformStudentId === student2?.id
                                                                          && f?.activityId === currentActivityId; });
          const student1HasFeedback = !!student1Feedback?.get("existingFeedbackSinceLastSort");
          const student2HasFeedback = !!student2Feedback?.get("existingFeedbackSinceLastSort");

          const student1Progress = studentProgress?.[student1?.id]?.[currentActivityId];
          const student2Progress = studentProgress?.[student2?.id]?.[currentActivityId];

          const student1SortGroup = student1Progress === 0 ? kSortGroupThird : student1HasFeedback ? kSortGroupSecond : kSortGroupFirst;
          const student2SortGroup = student2Progress === 0 ? kSortGroupThird : student2HasFeedback ? kSortGroupSecond : kSortGroupFirst;
          const feedbackComp = student1SortGroup === student2SortGroup ? 0 : student1SortGroup > student2SortGroup ? 1 : -1;
          return feedbackComp;
        });
      default:
        return students.toList();
    }
  },
);

// Returns sorted students in question feedback view
export const getQuestionFeedbackSortedStudents = createSelector(
  [ getStudents, getDashboardFeedbackSortBy, getFeedback, getCurrentQuestion, getFirstQuestion, getAnswersByQuestion ],
  (students, feedbackSortBy, feedback, currentQuestion, firstQuestion, answers ) => {
    switch (feedbackSortBy) {
      case SORT_BY_FEEDBACK_NAME:
        return students.toList().sort((student1, student2) =>
          compareStudentsByName(student1, student2),
        );
      case SORT_BY_FEEDBACK_PROGRESS:
        // TODO: change to sort by question feedback
        return students.toList().sort((student1, student2) => {
          const questionFeedbacks = feedback?.questionFeedbacks;
          const question = currentQuestion ? currentQuestion : firstQuestion;
          const questionId = question?.id;
          const student1Feedback = questionFeedbacks.find(function(f) { return f?.platformStudentId === student1?.id
                                                                          && f?.questionId === questionId; });
          const student2Feedback = questionFeedbacks.find(function(f) { return f?.platformStudentId === student2?.id
                                                                          && f?.questionId === questionId; });
          const student1HasFeedback = !!student1Feedback?.get("existingFeedbackSinceLastSort");
          const student2HasFeedback = !!student2Feedback?.get("existingFeedbackSinceLastSort");

          const student1Answer = answers?.[questionId]?.[student1?.id];
          const student2Answer = answers?.[questionId]?.[student2?.id];
          const student1Answered = student1Answer && (!question?.required || student1Answer?.submitted);
          const student2Answered = student2Answer && (!question?.required || student2Answer?.submitted);

          const student1SortGroup = !student1Answered ? kSortGroupThird : student1HasFeedback ? kSortGroupSecond : kSortGroupFirst;
          const student2SortGroup = !student2Answered ? kSortGroupThird : student2HasFeedback ? kSortGroupSecond : kSortGroupFirst;
          const feedbackComp = student1SortGroup === student2SortGroup ? 0 : student1SortGroup > student2SortGroup ? 1 : -1;
          return feedbackComp;
        });
      default:
        return students.toList();
    }
  },
);

