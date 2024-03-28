import { createSelector } from "reselect";
import { getAnswerTrees } from "./report-tree";
import { compareStudentsOrTeachersByName } from "../util/misc";

// Inputs
const getCompareViewAnswers = state => state.get("report").get("compareViewAnswers");

// Simply maps answer keys to proper answer objects that can be consumed by components.
const getCompareViewData = createSelector(
  [ getCompareViewAnswers, getAnswerTrees ],
  (compareViewAnswers, answerTrees) =>
    compareViewAnswers
      .map(id => answerTrees.get(id))
      .sort((ans1, ans2) => compareStudentsOrTeachersByName(ans1.get("student"), ans2.get("student")))
);

export default getCompareViewData;
