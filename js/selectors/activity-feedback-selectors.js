import { createSelector } from "reselect";
import { fromJS, Map as IMap } from "immutable";
import { compareStudentsByName, feedbackValidForAnswer } from "../util/misc";
import {
  AUTOMATIC_SCORE,
  MAX_SCORE_DEFAULT,
  RUBRIC_SCORE,
} from "../util/scoring-constants";

/* These functions compute data for views.
 * Some of the computations are expensive, so we use reselect to memoize
 * the results. Because we use the selectors on multiple components and
 * because we use the components `props` for our calculations, we use
 * `makeGet<property>` to bind each memoized function with a single component.
 * See: https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
 *
 * When we compose selectors, we must first instantiate the parent
 * selectors by something like `const getFoo = makeGetFoo()` and then
 * pass the memoized selectors as arguments to `createSelector`
 * See the reselect docs: https://github.com/reduxjs/reselect
 /

/*************************************************************************
 * Simple helper functions:
 *************************************************************************/
const keyFor = (activity, student) => `${activity.get("id")}-${student.get("id")}`;

const isNumeric = obj => obj !== undefined && typeof (obj) === "number" && !isNaN(obj);

// If a student has no feedback yet, use this template:
const newFeedback = (activityMap, studentMap) => {
  const student = studentMap.toJS();
  const key = keyFor(activityMap, studentMap);
  const newFeedbackRecord = {
    student,
    platformStudentId: student.id,
    feedback: "",
    score: 0,
    activityId: activityMap.get("id"),
    hasBeenReviewed: false
  };
  return fromJS(newFeedbackRecord);
};

// Add the students realname to the student record.
const addRealName = (student) => {
  return student.set("realName", `${student.get("firstName")} ${student.get("lastName")}`);
};

// return existing or now activityFeedback for a student
// Includes merged student data
const activityFeedbackFor = (activity, student, feedbacks) => {
  const key = keyFor(activity, student);
  const found = feedbacks.get(key);
  if (found) {
    return found.set("student", student);
  }
  return newFeedback(activity, student);
};

const feedbackIsMarkedComplete = (fb) => {
  return fb && fb.get("hasBeenReviewed");
};

const getFeedbacksNotAnswered = (fbs) => fbs;
// TODO: ⬆  How do we know if a student hasn't started yet?

const getFeedbacksNeedingReview = (feedbacks) => {
  return feedbacks
    .filter(f => !feedbackIsMarkedComplete(f));
};

const formatStudents = (students) => students
  .sort((student1, student2) => compareStudentsByName(student1, student2))
  .map(s => addRealName(s));

const getActivitySettings = (feedbackSettings, activity) =>
  feedbackSettings.getIn(["activitySettings", activity.get("id")]) || IMap({});

const getQuestionSettings = (feedbackSettings, question) =>
  feedbackSettings.getIn(["questionSettings", question.get("id")]) || IMap({});

/*************************************************************************
 * Simple selectors:
 *************************************************************************/
const getReport = (state) => state.get("report");
const getActivity = (state, props) => props.activity;
const getActivityFeedbacks = (state) => state.getIn(["feedback", "activityFeedbacks"]);
const getQuestionFeedbacks = (state) => state.getIn(["feedback", "questionFeedbacks"]);
const getFeedbackSettings = (state) => state.getIn(["feedback", "settings"]);
const getStudents = (state) => state.getIn(["report", "students"]);
const getRubics = (state) => state.get("rubrics");

/*************************************************************************
 * Composite selectors (composed of other selectors).
 * These are created via factory methods so each component has its own instance.
 * Most of these depend (via cascaded selector input) on the activty.
 * We partition our selectors based on the activity to limit cascading cache
 * invadliations. Because the activityID is not part of the state tree
 * we get the value from the component `props`.
 *************************************************************************/

// Memoization factory for thes score type
// Updates when the activity Changes
const makeGetScoreType = () => createSelector(
  getActivity,
  getFeedbackSettings,
  (activity, feedbackSettings) => getActivitySettings(feedbackSettings, activity).get("scoreType")
);

// Memoization factory for the rubric
// Updates when the rubric, or activity Changes
export const makeGetRubric = () => createSelector(
  getRubics,
  getActivity,
  getFeedbackSettings,
  (rubrics, activity, feedbackSettings) => {
    const rubricUrl = getActivitySettings(feedbackSettings, activity).get("rubricUrl");
    return rubricUrl && rubrics.get(rubricUrl) ? rubrics.get(rubricUrl).toJS() : null;
  }
);

/*******************************************************************************
IActivity {
  id: int,
  type: 'Activity',
  maxScore: int
  name: string,
  scoreType: string 'manual|atuo|rubric|none'
  activityFeedback: string[] // feedback id's
  activityFeedbackId: int // ID for feedback ?? Can we get rid of this?
  textFeedbackEnabled: boolean
  children: Map[] // a nested tree of sections → pages → questions → answers …
  questions: nested tree of questions …
  pages: nested tree of pages …
}

IStudent{
  firstName: string,
  id: integer,
  lastName: string,
  name: string,
  realName: string,  // duplicate of 'name'
}

IAFeedback {
  feedback: string,
  hasBeenReviewed: boolean,
  rubricFeedback: {IRubricFeedback},
  score
}

IActivityFeedbacks {
  key: string,
  learnerID: integer,
  studentID: integer,
  feedbacks: [IAFeedback]
}
 ******************************************************************************/

/*******************************************************************************
 * @function getStudentFeedbacks : get most recent feedback & summary data
 * @argument activity : IActivity
 * @argument students : Map <IStudent> - description
 * @argument activityFeedbacks : Map <activityID: <IActivityFeedback>
 * @returns {
    feedbacks:
    activityFeedbacks:
    feedbacksNeedingReview:
    feedbacksNotAnswered:
    numFeedbacksNeedingReview:
    scores:
    rubricFeedbacks:
  }
 ******************************************************************************/
export const getStudentFeedbacks = (activity, students, activityFeedbacks) => {
  students = formatStudents(students);
  const feedbacks = students.map(s => activityFeedbackFor(activity, s, activityFeedbacks)).toList();
  const feedbacksNeedingReview = getFeedbacksNeedingReview(feedbacks);
  const feedbacksNotAnswered = getFeedbacksNotAnswered(feedbacks);
  const numFeedbacksNeedingReview = feedbacksNeedingReview.size;

  const reviewedFeedback = activityFeedbacks
    .filter(f => f.get("hasBeenReviewed") === true);

  const scores = reviewedFeedback
    .map(f => f.get("score"))
    .filter(x => x)
    .toList()
    .toJS();

  const rubricFeedbacks = reviewedFeedback
    .map(f => f.get("rubricFeedback"))
    .filter(x => x)
    .toList()
    .toJS();

  const returnValue = {
    feedbacks,
    activityFeedbacks,
    feedbacksNeedingReview,
    feedbacksNotAnswered,
    numFeedbacksNeedingReview,
    scores,
    rubricFeedbacks,
  };
  return returnValue;
};

// Memoization factory for student activty feedback
// changes to activity, students, or actFeedbacks cause update.
export const makeGetStudentFeedbacks = () => {
  return createSelector(
    getActivity,
    getStudents,
    getActivityFeedbacks,
    (activity, students, activityFeedbacks) => getStudentFeedbacks(activity, students, activityFeedbacks),
  );
};

// Memoization factory: all Activity questions
// changes to report, or activity cause update.
export const makeGetQuestions = () => createSelector(
  getReport,
  getActivity,
  (report, activity) => {
    const sections = activity.get("children");
    const pages = sections.flatMap(s => s.get("children"));
    const questions = pages.flatMap(page => page.get("children"));
    return questions.map((v, i) => report.getIn(["questions", v.get("id")]));
  },
);

// Memoization factory: Automatic scores.
// updates when report, question, or question feedback changs.
export const makeGetQuestionAutoScores = () => {
  const getQuestions = makeGetQuestions();
  return createSelector(
    getReport,
    getQuestions,
    getQuestionFeedbacks,
    getFeedbackSettings,
    (report, questions, questionFeedbacks, feedbackSettings) => {
      const getFeedbackScore = (answer) => {
        const feedback = questionFeedbacks.get(answer.get("id"));
        if (!feedbackValidForAnswer(feedback, answer)) {
          return false;
        }
        return feedback.get("score") || 0;
      };

      const scoredQuestionIds = questions
        .filter(question => getQuestionSettings(feedbackSettings, question).get("scoreEnabled"))
        .map(question => question.get("id"));

      const scores = report.get("answers")
        .toList()
        .filter(answer => scoredQuestionIds.indexOf(answer.get("questionId")) !== -1)
        .groupBy(answer => answer.get("platformUserId"))
        .map(studentAnswers => studentAnswers
          .map(studentAnswer => getFeedbackScore(studentAnswer))
          .filter(a => isNumeric(a))
        );
      return scores.map(s => s.reduce((sum, v) => sum + v, 0));
    },
  );
};

/*******************************************************************************
 * @function getRubricScores : return scores from most recent rubric feedback
 * TODO: We `export` this function so we can test it.
 * TODO: We should consider cleaning up the function arguments so they are more
 * consistent. e.g. make them all Immutable ... also: `feedbacks.feedbacks`?
 * @argument rubric : Plain JSObj (not immutable?!) type IRubricDef
 * @argument feedbacks : Plain JSObj containing {feedbacks: <Immutable Map> }
 * @returns scores : IMap  ( {'<student-id>': score} )
 ******************************************************************************/
export const getRubricScores = (rubric, feedbacks) => {
  let scores = IMap({});
  feedbacks.feedbacks.forEach(feedback => {
      const key = feedback.get("platFormStudentId");
      let score = null;
      if (feedback.get("rubricFeedback")) {
        const rubricFeedback = feedback.get("rubricFeedback");
        score = rubricFeedback.map((v, k) => v.get("score")).reduce((p, n) => p + n);
        scores.set(key, score);
      }
      scores = scores.set(key, score);
    });
  return scores;
};

// Memoization factory: rubric feedback
// updates whenever rubric or feedbacks change
const makeGetRubricScores = () => {
  const getFeedbacks = makeGetStudentFeedbacks();
  const getRubric = makeGetRubric();
  return createSelector(
    getRubric,
    getFeedbacks,
    getRubricScores,
  );
};

export const getAutoscores = (scoreType, rubricScores, questionAutoScores) => {
  switch (scoreType) {
    case RUBRIC_SCORE:
      return rubricScores.filter(isNumeric);
    case AUTOMATIC_SCORE:
    default:
      return questionAutoScores;
  }
};

// Memoization factory: for automatic scoring (both types)
// updates when rubricscores or question scores changes.
export const makeGetAutoScores = () => {
  const getScoreType = makeGetScoreType();
  const getRubricScores = makeGetRubricScores();
  const getQuestionAutoScores = makeGetQuestionAutoScores();
  return createSelector(
    getScoreType,
    getRubricScores,
    getQuestionAutoScores,
    getAutoscores,
  );
};

// Memoization factory for the maximum auto score
// Updates when questions are changed.
const makeGetAutoMaxScore = () => {
  const getQuestions = makeGetQuestions();
  return createSelector(
    getQuestions,
    getFeedbackSettings,
    (questions, feedbackSettings) => {
      return questions
        .filter(question => getQuestionSettings(feedbackSettings, question).get("scoreEnabled"))
        .map(question => isNumeric(getQuestionSettings(feedbackSettings, question).get("maxScore"))
          ? getQuestionSettings(feedbackSettings, question).get("maxScore")
          : MAX_SCORE_DEFAULT)
        .reduce((total, score) => total + score, 0);
    },
  );
};

// Memoization factory for the maximum rubric score
// Updates when rubric changes.
const makeGetRubricMaxScore = () => {
  const maxReducer = (prev, current) => current > prev ? current : prev;
  const getRubric = makeGetRubric();
  return createSelector(
    getRubric,
    (rubric) => {
      if (!rubric) { return 0; }
      const criteria = rubric.criteria;
      const ratings = rubric.ratings;
      const numCrit = (criteria && criteria.length) || 0;
      const maxScore = ratings.map((r, i) => r.score || i).reduce(maxReducer, 0);
      return numCrit * maxScore;
    },
  );
};

// Memoization factory for the maximum score,
// Updates when scoreType, autoMaxScore, or rubricMaxScore changes.
export const makeGetComputedMaxScore = (questions, rubric, scoreType) => {
  const getScoreType = makeGetScoreType();
  const getAutoMaxScore = makeGetAutoMaxScore();
  const getRubricMaxScore = makeGetRubricMaxScore();
  return createSelector(
    getScoreType,
    getAutoMaxScore,
    getRubricMaxScore,
    (scoreType, autoMaxScore, rubicMaxScore) => {
      switch (scoreType) {
        case AUTOMATIC_SCORE:
          return autoMaxScore;
        case RUBRIC_SCORE:
          return rubicMaxScore;
      }
      return MAX_SCORE_DEFAULT;
    },
  );
};
