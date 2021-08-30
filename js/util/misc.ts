import { Map } from "immutable";
import md5 from "md5";
import queryString from "query-string";
import config, { configBool } from "../config";

// Truncate strings eg:
// truncate("this is a sentence", 5) // → "this i…"
export const truncate = (str: string, size: number) => (str.length > size) ? `${str.substr(0, size - 1)}…` : str;

export const parseUrl = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  return a;
};

// A comparison function to sort students by last and then first name
export const compareStudentsByName = (student1: Map<string, any>, student2: Map<string, any>) => {
  const lastNameCompare = student1.get("lastName").toLocaleLowerCase().localeCompare(
    student2.get("lastName").toLocaleLowerCase(),
  );
  if (lastNameCompare !== 0) {
    return lastNameCompare;
  } else {
    return student1.get("firstName").localeCompare(student2.get("firstName"));
  }
};

// A fake MD5 hash that we'll use whenever the answer field is undefined
export const MD5_FOR_UNDEFINED = "0def0def0def0def0def0def0def0def";

export const answerHash = (answer: Map<string, any>) => {
  let answerContent = answer.get("answer");
  if (answerContent === undefined) {
    // There are error cases where the answer property is not defined
    // JSON.stringify of undefined is undefined and undefined breaks the md5 function
    // Rather than throwing an exception, we return a fixed value this way if the answer
    // get repaired the hash will change.
    // In theory, this also means the teacher can provide feedback to the student even in
    // these error cases.
    // However in the standard report some other code is preventing this feedback.
    // In the portal dashboard this feedback is working for these error cases.
    return MD5_FOR_UNDEFINED;
  }

  if (typeof answerContent !== "string") {
    // the non-Map case likely doesn't hit at present, but this adds protection
    // in case future answerContent has non-string/non-Map value
    answerContent = Map.isMap(answerContent)
      ? JSON.stringify(answerContent.sortBy((v: any, k: any) => k).toJS())
      : JSON.stringify(answerContent);
  }
  return md5(answerContent);
};

export const feedbackValidForAnswer = (feedback: Map<string, any>, answer: Map<string, any>) => {
  if (!feedback || !answer) {
    return false;
  }
  return feedback.get("hasBeenReviewedForAnswerHash") === answerHash(answer);
};

// Returns path that only includes allowed Firestore characters.
// Firestore docs say:
// Must be valid UTF-8 characters
// Must be no longer than 1,500 bytes
// Cannot contain a forward slash (/)
// Cannot solely consist of a single period (.) or double periods (..)
// Cannot match the regular expression __.*__
export const validFsId = (anyPath: string) => {
  const safeCharacter = "%";
  return anyPath
    .replace(/\//g, safeCharacter)
    .replace(/\.\./g, safeCharacter)
    .replace(/__/g, safeCharacter);
};

export function urlParam(name: string): string | null{
  return urlStringParam(window.location.search, name);
}

export function urlHashParam(name: string): string | null{
  return urlStringParam(window.location.hash, name);
}

export function urlStringParam(stringToParse: string, name: string): string | null{
  const result = queryString.parse(stringToParse)[name];
  if (typeof result === "string") {
    return result;
  } else if (result && result.length) {
    return result[0];
  } else {
    return null;
  }
}

export type ColorTheme = "progress" | "response" | "feedback" |
                         "progressNavigation" | "responseNavigation" | "feedbackNavigation" |
                         "progressAssignment" | "responseAssignment" | "feedbackAssignment";

export type DashboardViewMode = "ProgressDashboard" | "ResponseDetails" | "FeedbackReport";

export type ListViewMode = "Student" | "Question";

export type FeedbackLevel = "Activity" | "Question";

export const FULL_REPORT = "fullReport";
export const DASHBOARD = "dashboard";
export const PORTAL_DASHBOARD = "portalDashboard";
export const IFRAME_STANDALONE = "iframeStandalone";

export function getViewType () {
  return config("iframeQuestionId") ? IFRAME_STANDALONE :
         configBool("portal-dashboard") ? PORTAL_DASHBOARD :
         configBool("dashboard") ? DASHBOARD : FULL_REPORT;
}
