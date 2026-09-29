import { urlParam } from "./misc";
import { getPortalBaseUrl } from "../api";

// No token: with auth-domain set, the page signs in through the portal, so only people with class access can open it.
const SHAREABLE_LAUNCH_PARAMS = ["firebase-app", "class", "offering", "answersSourceKey"];

// A link to portal-report's single-question view of one student's answer. It keeps the given
// launch parameters and adds the ones the view needs to find the answer and sign in.
export const buildAnswerLink = (launchParams: URLSearchParams, questionId: string, studentId: string | number) => {
  const params = new URLSearchParams(launchParams);
  const authDomain = getPortalBaseUrl();
  if (authDomain) {
    params.set("auth-domain", authDomain);
  }
  params.set("iframeQuestionId", questionId);
  params.set("studentId", String(studentId));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

// The answer link for the CSV's _url columns, with the parameters report-service's links use.
export const getAnswerLink = (sourceKey: string, questionId: string, studentUserId: string | number) => {
  const launchParams = new URLSearchParams({ sourceKey });
  SHAREABLE_LAUNCH_PARAMS.forEach(name => {
    const value = urlParam(name);
    if (value) {
      launchParams.set(name, value);
    }
  });
  return buildAnswerLink(launchParams, questionId, studentUserId);
};
