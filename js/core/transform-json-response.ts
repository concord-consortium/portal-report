import { normalize, schema } from "normalizr";
import humps from "humps";
import { IPortalRawData } from "../api";

export interface IResource {
  id: number;
  name: string;
  type: string;
  children: IResource[] | IQuestion[];
}

export interface IQuestion extends IResource {
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
  };
  classInfo: {
    id: number;
    name: string;
    classHash: string;
    students: IStudentData[];
  };
  userType: "teacher" | "learner";
}

export interface IStudentData {
  email: string;
  name: string;
  realName: string;
  firstName: string;
  lastName: string;
  id: string;
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

function camelizeKeys(json: any) {
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
  const camelizedJson = preprocessResourceJSON(camelizeKeys(json) as IResource);

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

export function preprocessResourceJSON(resourceJson: IResource) {
  // Provide fake sequence if it's not present to simplify app logic.
  if (resourceJson.type === "activity") {
    resourceJson = {
      id: 1,
      name: "",
      type: "sequence",
      children: [ resourceJson ],
    };
  }
  // Add some question properties, e.g. question numbers, selection, visibility.
  resourceJson.children.forEach((activity: IResource) => {
    activity.children.forEach(section => {
      section.children.forEach(page => {
        page.children.forEach((question: IQuestion) => {
          // Nothing is selected by default.
          question.selected = false;
          if (question.type === "multiple_choice" && question.choices) {
            // Multiple choice question is scored if at least one choice is marked as correct.
            question.scored = question.choices.some(c => c.correct);
          }
        });
      });
    });
  });
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
  const camelizedJson = camelizeKeys(portalData) as IPortalData;
  camelizedJson.classInfo.students.forEach(student => {
    student.id = student.email;
    student.name = `${student.firstName} ${student.lastName}`;
    // Provide additional property in student hash, it's useful for anonymization.
    student.realName = student.name;
  });
  return camelizedJson;
}

// Old functions that might get useful when we're restoring missing functionality:

// function applyVisibilityFilter(questions, visibilityFilter) {
//   Object.values(questions).forEach(question => {
//     question.selected = false;
//     question.visible = false;
//   });
//   visibilityFilter.questions.forEach(key => {
//     // in some cases, we will only be looking at a subset of questions,
//     // for example when viewing the activity report for a sequence.
//     // There may not be a question for the key. Check first.
//     if (questions[key]) {
//       questions[key].selected = true;
//       questions[key].visible = true;
//     }
//   });
// }
//
// // Keys are generated by normalizr above, so just copy them to the object hashes.
// function copyAnswerKeysToObjects(answers) {
//   Object.keys(answers).forEach(key => {
//     answers[key].key = key;
//   });
// }
//
//
// function urlParamOverrides(response) {
//   const {reportFor, studentId} = queryString.parse(window.location.search);
//   if (reportFor) {
//     response.type = reportFor;
//   }
//   if (studentId && reportFor === "student") {
//     response.studentId = studentId;
//     response.hideControls = true;
//     if (response.result) {
//       response.result.hideControls = true;
//     }
//   }
// }