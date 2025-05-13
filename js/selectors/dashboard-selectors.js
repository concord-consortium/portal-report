import { createSelector } from "reselect";
import { fromJS } from "immutable";
import { getActivityTrees, getQuestionTrees, getAnswersByQuestion } from "./report-tree";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS,
         SORT_BY_FEEDBACK_PROGRESS } from "../actions/dashboard";
import { sortByName, sortByProgress, sortByActivityFeedbackProgress, sortByQuestionFeedbackProgress } from "../util/sort-utils";

// Inputs
const getActivities = state => state.getIn(["report", "activities"]);
export const getIsResearcher = state => state.getIn(["report", "userType"]) === "researcher";
export const getAnonymous = state => state.getIn(["report", "anonymous"]);
const getCurrentActivityId = state => state.getIn(["dashboard", "currentActivityId"]);
const getQuestions = state => state.getIn(["report", "questions"]);
const getCurrentQuestionId = state => state.getIn(["dashboard", "currentQuestionId"]);
export const getCurrentStudentId = state => state.getIn(["dashboard", "currentStudentId"]);
const getStudents = state => state.getIn(["report", "students"]);
const getFeedback = state => state.getIn(["feedback"]);
export const getDashboardSortBy = state => state.getIn(["dashboard", "sortBy"]);
export const getDashboardFeedbackSortBy = state => getDashboardSortBy(state);
const getSeletedQuestionId = state => state.getIn(["dashboard", "selectedQuestion"]);
export const getCompactReport = state => state.getIn(["dashboard", "compactReport"]);
export const getHideFeedbackBadges = state => state.getIn(["dashboard", "hideFeedbackBadges"]);
export const getfeedbackSortRefreshEnabled = state => state.getIn(["dashboard", "feedbackSortRefreshEnabled"]);

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

export const getCurrentActivity = createSelector(
  [ getActivities, getCurrentActivityId ],
  (activities, currentActivityId) => {
    return activities.find(activity => activity.get("id") === currentActivityId);
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
    return questions.find(activity => activity.get("id") === currentQuestionId);
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
  [ getStudents, getDashboardSortBy, getStudentAverageProgress, getFeedback, getStudentProgress, getCurrentActivity, getFirstActivity, getCurrentQuestion, getFirstQuestion, getAnswersByQuestion ],
  (students, sortBy, studentProgress, feedback, studentProgressByActivity, currentActivity, firstActivity, currentQuestion, firstQuestion, answers) => {
    switch (sortBy) {
      case SORT_BY_NAME:
        return sortByName(students);
      case SORT_BY_FEEDBACK_PROGRESS:
        const isQuestionLevelFeedback = !!currentQuestion;
        return isQuestionLevelFeedback
          ? sortByQuestionFeedbackProgress(students, feedback, currentQuestion, firstQuestion, answers)
          : sortByActivityFeedbackProgress(students, feedback, studentProgressByActivity, currentActivity, firstActivity);
      case SORT_BY_LEAST_PROGRESS:
      case SORT_BY_MOST_PROGRESS:
        return sortByProgress(students, studentProgress, sortBy);
      default:
        return students.toList();
    }
  },
);
