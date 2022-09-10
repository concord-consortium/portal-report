import { createSelector } from "reselect";
import { getViewType, FULL_REPORT, DASHBOARD, PORTAL_DASHBOARD } from "../util/misc";

// `getSequenceTree` generates tree that is consumed by React components from reportState (ImmutableJS Map).
// Redux state has flat structure. This selector maps all the IDs and keys and creates a tree-like hierarchy.
// It includes all the properties provided by API + calculates a few additional ones.

// Inputs
const getSequences = state => state?.report?.sequences;
const getActivities = state => state?.report?.activities;
const getPages = state => state?.report?.pages;
const getSections = state => state?.report?.sections;
const getQuestions = state => state?.report?.questions;
const getAnswers = state => state?.report?.answers;
const getStudents = state => state?.report?.students;
const getHideSectionNames = state => state?.report?.hideSectionNames;
const getShowFeaturedQuestionsOnly = state => state?.report?.showFeaturedQuestionsOnly;

// Helpers
// Why isn't this helper used by React components directly? So we don't have to care about view type here?
// The problem is that if all the questions on given page are not visible, page should not be visible too.
// If all the pages are not visible, then section is not visible too. And the same thing applies to activities.
// It's convenient to calculate all that here while building a report tree.

const isQuestionVisible = (question, featuredOnly) => {
  const viewType = getViewType();
  // Custom question filtering is currently supported only by regular, non-dashboard report.
  // There are no checkboxes and controls in dashboard.
    if (viewType === FULL_REPORT && question?.hiddenByUser) {
    return false;
  }
  // Only dashboard is considered to be "featured question report". In the future, when there's a toggle
  // letting user switch `showFeaturedQuestionsOnly` on and off, this might not be the case anymore.
  // Note that === false check is explicit and it's like that by design. If API does not provide this property
  // (so the value is undefined or null), assume that the question is visible in the featured question report.
  // It's necessary so this report works before Portal (API) is updated to provide this flag. Later, it will be
  // less important. Additionally, for now we assume that the newer portal-dashboard follows the same logic.
  if (((viewType === DASHBOARD) || (viewType === PORTAL_DASHBOARD)) && featuredOnly && question?.showInFeaturedQuestionReport === false) {
    return false;
  }
  return true;
};

// Selectors
export const getAnswerTrees = createSelector(
  [ getAnswers, getStudents, getQuestions],
  (answers, students, questions) => {

  return answers
      // Filter out answers that are not matching any students in the class. Class could have been updated.
      // Also, filter out answers that are not matching any question. It might happen if the activity gets updated and
      // some questions are deleted.
      .filter(answer => students.has(answer?.platformUserId) && questions.has(answer?.questionId))
      .map(answer => {
        if (answer?.type === "multiple_choice_answer") {
          const question = questions?.[answer.get("questionId")];
          // `|| []` => in case question doesn't have choices.
          const choices = Map((question?.choices || []).map(c => [c?.id, c]));
          const selectedChoices = answer?.answer?.choiceIds
            .map(id => choices?.[id] || Map({content: "[the selected choice has been deleted by question author]", correct: false, id: -1}));
          const selectedCorrectChoices = selectedChoices.filter(c => c?.correct);
          answer = {...answer};
          answer.scored = question?.scored;
          answer.selectedChoices = selectedChoices;
          answer.correct = selectedChoices.size > 0 && selectedChoices.size === selectedCorrectChoices.size;
        }
        answer.student = students?.[answer?.platformUserId];
        return answer;
      });
    }
);

export const getAnswersByQuestion = createSelector(
  [ getAnswerTrees],
  (answers) => {
    // Create tree like:
    // { question1.id: {student1.id: answer1, student2.id: answer2, ...},
    //   question2.id: {student3.id: answer3, student4.id: answer4, ...}
    //   ... }
    const answerTreeResult = answers.reduce((answerTree, answer) => {
      const questionId = answer?.questionId;
      let studentMap = answerTree?.[questionId] || {};
      studentMap = studentMap[answer?.platformUserId] = answer;
      answerTree[questionId] = studentMap;
      return answerTree;
    }, {});

    return answerTreeResult;
  }
);

export const getQuestionTrees = createSelector(
  [ getQuestions, getShowFeaturedQuestionsOnly ],
  ( questions, showFeaturedQuestionsOnly) => {
    return (questions || {}).map(question => {
      // This is only a temporal solution. Answers should no longer be added to a report tree.
      // Components that need answer content should become containers and request answers from redux state.
      return {
        ...question,
        answers: [],
        visible: isQuestionVisible(question, showFeaturedQuestionsOnly)
      }
    });
  },
);

export const getPageTrees = createSelector(
  [ getPages, getQuestionTrees ],
  (pages, questionTrees) =>
    pages.map(page => {
      const mappedChildren = page?.children.map(key => questionTrees?.[key]);
      return {
        ...page,
        children: mappedChildren,
        // Page is visible only if at least one question is visible.
        visible: !!mappedChildren.find(q => q?.visible)
      };
    })
);

export const getSectionTrees = createSelector(
  [ getSections, getPageTrees, getHideSectionNames ],
  (sections, pageTrees, hideSectionNames) =>
    sections.map(section => {
      const mappedChildren = section?.children.map(id => pageTrees?.[id.toString()]);
      return {
        ...section,
        children: mappedChildren,
        visible: !!mappedChildren.find(p => p?.visible),
        // Hide section titles for external activities.
        nameHidden: hideSectionNames
      };
    }),
);

export const getActivityTrees = createSelector(
  [ getActivities, getSectionTrees ],
  (activities, sectionTrees) =>
    activities.map(activity => {
      const mappedChildren = activity?.children.map(id => sectionTrees?.[id.toString()]);
      // Calculate additional properties, flattened pages and questions.
      const pages = mappedChildren.map(section => section?.children).flatten(1);
      const questions = pages.map(page => page?.children).flatten(1);
      return {
        ...activity,
        children: mappedChildren,
        pages,
        questions,
        // Activity is visible only if at least one section is visible.
        visible: !!mappedChildren.find(s => s?.visible)
      };
    })
);

export const getSequenceTree = createSelector(
  [ getSequences, getActivityTrees ],
  (sequences, activityTrees) => {
    // There is always only one sequence.
    const sequence = sequences.values().next().value;
    const mappedChildren = sequence?.children.map(id => activityTrees?.[id.toString()]);
    return {
      ...sequence,
      children: mappedChildren
    }
  },
);

export default getSequenceTree;
