import { Map } from "immutable";
import md5 from "md5";
import queryString from "query-string";

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

export const answerHash = (answer: Map<string, any>) => {
  let answerContent = answer.get("answer");
  if (typeof answerContent !== "string") {
    answerContent = JSON.stringify(answerContent.toJS());
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
  const result = queryString.parse(window.location.search)[name];
  if (typeof result === "string") {
    return result;
  } else if (result && result.length) {
    return result[0];
  } else {
    return null;
  }
}

export type SvgIcon = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
