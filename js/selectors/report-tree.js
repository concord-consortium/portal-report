import { createSelector } from "reselect";
import Immutable, { Map } from "immutable";
import { getViewType, FULL_REPORT, DASHBOARD, PORTAL_DASHBOARD } from "../util/misc";

// `getSequenceTree` generates tree that is consumed by React components from reportState (ImmutableJS Map).
// Redux state has flat structure. This selector maps all the IDs and keys and creates a tree-like hierarchy.
// It includes all the properties provided by API + calculates a few additional ones.

// Inputs
const getSequences = state => state.getIn(["report", "sequences"]);
const getActivities = state => state.getIn(["report", "activities"]);
const getPages = state => state.getIn(["report", "pages"]);
const getSections = state => state.getIn(["report", "sections"]);
const getQuestions = state => state.getIn(["report", "questions"]);
const getAnswers = state => state.getIn(["report", "answers"]);
const getStudents = state => state.getIn(["report", "students"]);
const getHideSectionNames = state => state.getIn(["report", "hideSectionNames"]);
const getShowFeaturedQuestionsOnly = state => state.getIn(["report", "showFeaturedQuestionsOnly"]);

// Helpers
// Why isn't this helper used by React components directly? So we don't have to care about view type here?
// The problem is that if all the questions on given page are not visible, page should not be visible too.
// If all the pages are not visible, then section is not visible too. And the same thing applies to activities.
// It's convenient to calculate all that here while building a report tree.

const isQuestionVisible = (question, featuredOnly) => {
  const viewType = getViewType();
  // Custom question filtering is currently supported only by regular, non-dashboard report.
  // There are no checkboxes and controls in dashboard.
    if (viewType === FULL_REPORT && question.get("hiddenByUser")) {
    return false;
  }
  // Only dashboard is considered to be "featured question report". In the future, when there's a toggle
  // letting user switch `showFeaturedQuestionsOnly` on and off, this might not be the case anymore.
  // Note that === false check is explicit and it's like that by design. If API does not provide this property
  // (so the value is undefined or null), assume that the question is visible in the featured question report.
  // It's necessary so this report works before Portal (API) is updated to provide this flag. Later, it will be
  // less important. Additionally, for now we assume that the newer portal-dashboard follows the same logic.
  if (((viewType === DASHBOARD) || (viewType === PORTAL_DASHBOARD)) && featuredOnly && question.get("showInFeaturedQuestionReport") === false) {
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
      .filter(answer => students.has(answer.get("platformUserId")) && questions.has(answer.get("questionId")))
      .map(answer => {
        if (answer.get("type") === "multiple_choice_answer") {
          const question = questions.get(answer.get("questionId"));
          // `|| []` => in case question doesn't have choices.
          const choices = Map((question.get("choices") || []).map(c => [c.get("id"), c]));
          const selectedChoices = answer.getIn(["answer", "choiceIds"])
            .map(id => choices.get(id) || Map({content: "[the selected choice has been deleted by question author]", correct: false, id: -1}));
          const selectedCorrectChoices = selectedChoices.filter(c => c.get("correct"));
          answer = answer
            .set("scored", question.get("scored"))
            .set("selectedChoices", selectedChoices)
            .set("correct", selectedChoices.size > 0 && selectedChoices.size === selectedCorrectChoices.size);
        }
        return answer
          .set("student", students.get(answer.get("platformUserId")));
      });
    }
);

export const getAnswersByQuestion = createSelector(
  [ getAnswerTrees],
  (answers) => {

    // Use withMutations so this isn't creating a lot of new objects
    const answerTreeResult = Map().withMutations(mutableTree => {
      // Create tree like:
      // { question1.id: {student1.id: answer1, student2.id: answer2, ...},
      //   question2.id: {student3.id: answer3, student4.id: answer4, ...}
      //   ... }
      return answers.reduce((answerTree, answer) => {
        const questionId = answer.get("questionId");
        let studentMap = answerTree.get(questionId) || Map();
        studentMap = studentMap.set(answer.get("platformUserId"), answer);
        return answerTree.set(questionId, studentMap);
      }, mutableTree);
    });

    return answerTreeResult;
  }
);

export const getQuestionTrees = createSelector(
  [ getActivities, getSections, getPages, getQuestions, getShowFeaturedQuestionsOnly ],
  ( activities, sections, pages, questions, showFeaturedQuestionsOnly) => {
    return (questions || Immutable.fromJS({})).map(question =>
      question
        // This is only a temporal solution. Answers should no longer be added to a report tree.
        // Components that need answer content should become containers and request answers from redux state.
        .set("answers", Immutable.fromJS([]))
        .set("visible", isQuestionVisible(question, showFeaturedQuestionsOnly))
    );
  },
);

export const getPageTrees = createSelector(
  [ getPages, getQuestionTrees ],
  (pages, questionTrees) =>
    pages.map(page => {
      const mappedChildren = page.get("children").map(key => questionTrees.get(key));
      return page
        .set("children", mappedChildren)
        // Page is visible only if at least one question is visible.
        .set("visible", !!mappedChildren.find(q => q.get("visible")));
    })
);

export const getSectionTrees = createSelector(
  [ getSections, getPageTrees, getHideSectionNames ],
  (sections, pageTrees, hideSectionNames) =>
    sections.map(section => {
      const mappedChildren = section.get("children").map(id => pageTrees.get(id.toString()));
      return section
        .set("children", mappedChildren)
        // Section is visible only if at least one page is visible.
        .set("visible", !!mappedChildren.find(p => p.get("visible")))
        // Hide section titles for external activities.
        .set("nameHidden", hideSectionNames);
    }),
);

export const getActivityTrees = createSelector(
  [ getActivities, getSectionTrees ],
  (activities, sectionTrees) =>
    activities.map(activity => {
      const mappedChildren = activity.get("children").map(id => sectionTrees.get(id.toString()));
      // Calculate additional properties, flattened pages and questions.
      const pages = mappedChildren.map(section => section.get("children")).flatten(1);
      const questions = pages.map(page => page.get("children")).flatten(1);
      return activity
        .set("children", mappedChildren)
        .set("pages", pages)
        .set("questions", questions)
        // Activity is visible only if at least one section is visible.
        .set("visible", !!mappedChildren.find(s => s.get("visible")));
    }),
);

export const getSequenceTree = createSelector(
  [ getSequences, getActivityTrees ],
  (sequences, activityTrees) => {
    // There is always only one sequence.
    const sequence = sequences.values().next().value;
    const mappedChildren = sequence.get("children").map(id => activityTrees.get(id.toString()));
    return sequence
      .set("children", mappedChildren);
  },
);

export default getSequenceTree;
