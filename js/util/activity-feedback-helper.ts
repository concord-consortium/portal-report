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
