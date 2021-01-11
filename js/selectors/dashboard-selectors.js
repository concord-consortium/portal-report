import { createSelector } from "reselect";
import { getActivityTrees, getQuestionTrees, getAnswersByQuestion } from "./report-tree";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS, SORT_BY_FEEDBACK } from "../actions/dashboard";
import { compareStudentsByName } from "../util/misc";
import { fromJS } from "immutable";

// Inputs
const getActivities = state => state.getIn(["report", "activities"]);
export const getAnonymous = state => state.getIn(["report", "anonymous"]);
const getCurrentActivityId = state => state.getIn(["dashboard", "currentActivityId"]);
const getQuestions = state => state.getIn(["report", "questions"]);
const getCurrentQuestionId = state => state.getIn(["dashboard", "currentQuestionId"]);
export const getCurrentStudentId = state => state.getIn(["dashboard", "currentStudentId"]);
const getStudents = state => state.getIn(["report", "students"]);
const getFeedback = state => state.getIn(["feedback"]);
export const getDashboardSortBy = state => state.getIn(["dashboard", "sortBy"]);
const getSeletedQuestionId = state => state.getIn(["dashboard", "selectedQuestion"]);
export const getCompactReport = state => state.getIn(["dashboard", "compactReport"]);
export const getHideFeedbackBadges = state => state.getIn(["dashboard", "hideFeedbackBadges"]);

// When a user selects a to display question details by
// Clicking on the question column expand icon.
export const getSelectedQuestion = createSelector(
  [getQuestionTrees, getSeletedQuestionId],
  (questions, id) => {
    if (questions && id) {
      return questions
        .get(id.toString(), fromJS({}));
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
    const answer = answers.getIn([question.get("id"), student.get("id")]);
    if (answer &&
      // If question is required, its answer must be submitted.
      (!question.get("required") || answer.get("submitted") === true)) {
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
        const activityQuestions = activity.get("questions").filter(q => q.get("visible"));

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
      const activitiesProgress = studentProgress.get(student.get("id")).toList();
      return activitiesProgress.reduce((sum, progress) => sum + progress) / activitiesProgress.size;
    });
  },
);

// Returns sorted students
export const getSortedStudents = createSelector(
  [ getStudents, getDashboardSortBy, getStudentAverageProgress, getFeedback ],
  (students, sortBy, studentProgress, feedback) => {
    switch (sortBy) {
      case SORT_BY_NAME:
        return students.toList().sort((student1, student2) =>
          compareStudentsByName(student1, student2),
        );
      case SORT_BY_LEAST_PROGRESS:
      case SORT_BY_MOST_PROGRESS:
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
      case SORT_BY_FEEDBACK:
        return students.toList().sort((student1, student2) => {
          // TODO: add support for question feedback, also determine if student has started activity or answered question
          const activityFeedbacks = feedback.get("activityFeedbacks");
          const student1Feedback = activityFeedbacks.find(function(f) { return f.get('platformStudentId') === student1.get("id"); });
          const student2Feedback = activityFeedbacks.find(function(f) { return f.get('platformStudentId') === student2.get("id"); });
          const student1HasFeedback = student1Feedback !== undefined ? true : false;
          const student2HasFeedback = student2Feedback !== undefined ? true : false;
          const feedbackComp = (student1HasFeedback === student2HasFeedback) ? 0 : student1HasFeedback ? 1 : -1;
          return feedbackComp;
        });
      default:
        return students.toList();
    }
  },
);

export const getCurrentActivity = createSelector(
  [ getActivities, getCurrentActivityId ],
  (activities, currentActivityId) => {
    return activities.find(activity => activity.get("id") === currentActivityId);
  }
);

export const getCurrentQuestion = createSelector(
  [ getQuestions, getCurrentQuestionId ],
  (questions, currentQuestionId) => {
    return questions.find(activity => activity.get("id") === currentQuestionId);
  }
);
