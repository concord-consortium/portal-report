import { createSelector } from "reselect";
import { getAnswerTrees } from "./report-tree";

// Inputs
const getCompareViewAnswers = state => state.get("report").get("compareViewAnswers");

// Simply maps answer keys to proper answer objects that can be consumed by components.
const getCompareViewData = createSelector(
  [ getCompareViewAnswers, getAnswerTrees ],
  (compareViewAnswers, answerTrees) =>
    compareViewAnswers
      .map(key => answerTrees.get(key))
      .sortBy(answer => answer.getIn(["student", "name"])),
);

export default getCompareViewData;
