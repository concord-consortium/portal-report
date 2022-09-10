import { createSelector } from "reselect";
import { getAnswerTrees } from "./report-tree";
import { compareStudentsByName } from "../util/misc";

// Inputs
const getCompareViewAnswers = state => state.get("report")?.compareViewAnswers;

// Simply maps answer keys to proper answer objects that can be consumed by components.
const getCompareViewData = createSelector(
  [ getCompareViewAnswers, getAnswerTrees ],
  (compareViewAnswers, answerTrees) =>
    compareViewAnswers
      .map(id => answerTrees?.[id])
      .sort((ans1, ans2) => compareStudentsByName(ans1?.student, ans2?.student))
);

export default getCompareViewData;
