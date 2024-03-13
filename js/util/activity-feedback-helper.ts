import { validFsId } from "./misc";

export interface IActivityFeedbackRecord {
  feedback: any;
  activityId: string;
  resourceLinkId: string;
  platformStudentId: string;
  platformTeacherId: string;
  contextId: string;
}

export function getActivityStudentFeedbackKey(data: IActivityFeedbackRecord) {
  return validFsId(`${data.activityId}-${data.platformStudentId}`);
}

export function hasRubricFeedback(rubric: any, rubricFeedback: any) {
  let numFeedback = 0;
  rubric.criteria.forEach((crit: any) => {
    if (rubricFeedback && rubricFeedback[crit.id]) {
      if (rubricFeedback[crit.id].score > 0 && rubricFeedback[crit.id].id !== "") {
        numFeedback++;
      }
    }
  });
  return numFeedback !== 0;
}
