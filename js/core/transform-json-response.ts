import { normalize, schema } from "normalizr";
import humps from "humps";
import { getPortalBaseUrl, IPortalRawData } from "../api";
import queryString from "query-string";

export interface IResource {
  id: string;
  name: string;
  type: string;
  children: IResource[] | IQuestion[];
}

export interface IActivity extends IResource {
  activityIndex: number;
  url: string;
  // Note that when the data comes down this field is optional
  // But this interface is really intended for users of this data
  // after it has been transformed by the function below
  previewUrl: string;
}

export interface ISection extends IResource {
  activity: string;
}

export interface IPage extends IResource {
  activity: string;
  section: string;
  url: string;
  // Note that when the data comes down this field is optional
  // But this interface is really intended for users of this data
  // after it has been transformed by the function below
  previewUrl: string;
}

export interface IQuestion extends IResource {
  activity: string;
  section: string;
  page: string;
  questionUrl: string;
  questionTeacherEditionUrl: string;
  prompt: string;
  selected: boolean;
  scored?: boolean; // multiple choice only
  choices?: IChoice[]; // multiple choice only
}

export interface IChoice {
  id: number;
  content: string;
  correct: boolean;
}

export interface IPortalData {
  offering: {
    activityUrl: string;
    id: number;
    teacher: string;
    hasTeacherEdition: boolean;
    rubricDocUrl: string;
  };
  classInfo: {
    id: number;
    name: string;
    classHash: string;
    students: IStudentData[];
  };
  userType: "teacher" | "learner" | "researcher";
  platformUserId: string;
  contextId: string;
  platformId: string;
  sourceKey: string;
}

export interface IStudentData {
  name: string;
  realName: string;
  firstName: string;
  lastName: string;
  lastRun: string | null;
  id: string;
  userId: number;
}
export interface IAnswerData {
  id: string;
  type: string;
  userEmail: string;
  selectedForCompare: boolean;
}

export interface IAnswerDataHash {
  [key: string]: IAnswerData;
}

export function camelizeKeys(json: any) {
  return humps.camelizeKeys(json, (key, convert) =>
    // Don't convert keys that are only uppercase letters and numbers.
    // This is useful for rubric keys for example "C2" and "R1".
    /^[A-Z0-9_]+$/.test(key) ? key : convert(key)
  );
}

// Transforms deeply nested structure of activity or sequence
// into normalized form where objects are grouped by ID.
// See: https://github.com/gaearon/normalizr
export function normalizeResourceJSON(json: any) {
  // preprocessResourceJSON transforms response a bit, e.g. provides additional properties that can be calculated
  // at this point or ensures that we always deal with a sequence.
  const camelizedJson = preprocessResourceJSON(camelizeKeys(json) as unknown as IResource);

  const sequence = new schema.Entity("sequences");
  const activity = new schema.Entity("activities");
  const section = new schema.Entity("sections");
  const page = new schema.Entity("pages");
  const question = new schema.Entity("questions");
  sequence.define({
    children: [ activity ],
  });
  activity.define({
    children: [ section ],
  });
  section.define({
    children: [ page ],
  });
  page.define({
    children: [ question ],
  });
  return normalize(camelizedJson, sequence);
}

// This is used to add mode=teacher-edition
export function addTeacherEditionMode(url: string) {
  const urlParts = queryString.parseUrl(url);
  urlParts.query.mode = "teacher-edition";
  const portalBaseUrl = getPortalBaseUrl();
  if (portalBaseUrl) {
    urlParts.query["auth-domain"] = portalBaseUrl;
  }
  return queryString.stringifyUrl(urlParts);
}

export function preprocessResourceJSON(resourceJson: IResource) {
  // Provide fake sequence if it's not present to simplify app logic.
  if (resourceJson.type === "activity") {
    resourceJson = {
      id: "1",
      name: "",
      type: "sequence",
      children: [ resourceJson ],
    };
  }
  // Add some question properties, e.g. question numbers, selection, visibility.
  resourceJson.children.forEach((activity: IActivity, idx: number) => {
    activity.activityIndex = idx;
    if (!activity.previewUrl) {
      activity.previewUrl = activity.url;
    }
    activity.children.forEach((section: ISection) => {
      section.activity = activity.id;
      section.children.forEach((page: IPage) => {
        page.activity = activity.id;
        page.section = section.id;
        // Note the incoming field is 'preview_url', but this gets camelized
        // before being sent to preprocessResourceJSON
        if (!page.previewUrl) {
          page.previewUrl = page.url;
        }
        page.children.forEach((question: IQuestion) => {
          question.activity = activity.id;
          question.section = section.id;
          question.page = page.id;
          question.questionUrl = page.previewUrl;
          question.questionTeacherEditionUrl = addTeacherEditionMode(page.previewUrl);
          // Nothing is selected by default.
          question.selected = false;
          if (question.type === "multiple_choice") {
            // Multiple choice question is scored if at least one choice is marked as correct.
            question.scored = question.choices ? question.choices.some(c => c.correct) : false;
          }
        });
      });
    });
  });

  // If `activityIndex` is provided as a URL parameter, filter activities to include only this one.
  const { activityIndex } = queryString.parse(window.location.search);
  if (activityIndex != null) {
    resourceJson.children = [ resourceJson.children[Number(activityIndex)] ];
    // Also, hide sequence name to make it more clear that we're looking just at one activity.
    resourceJson.name = "";
  }

  return resourceJson;
}

export function preprocessAnswersJSON(answersJSON: any): IAnswerDataHash {
  const camelizedJSON = camelizeKeys(answersJSON) as IAnswerData[];
  const result: IAnswerDataHash = {};
  camelizedJSON.forEach(answer => {
    answer.selectedForCompare = false;
    result[answer.id] = answer;
  });
  return result;
}

export function preprocessPortalDataJSON(portalData: IPortalRawData): IPortalData {
  const camelizedJson = camelizeKeys(portalData) as unknown as IPortalData;
  camelizedJson.classInfo.students.forEach(student => {
    student.id = student.userId.toString();
    student.name = `${student.firstName} ${student.lastName}`;
    // Provide additional property in student hash, it's useful for anonymization.
    student.realName = student.name;
  });
  return camelizedJson;
}

export function preprocessInteractiveStateHistoriesJSON(historiesJSON: any): any {
  return camelizeKeys(historiesJSON);
}
