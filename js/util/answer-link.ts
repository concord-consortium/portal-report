import { urlParam } from "./misc";
import { ensureScheme } from "../api";

// A link to portal-report's single-question view of one student's answer, in the form
// report-service uses for its _url column. The teacher's token is deliberately left out:
// with auth-domain set, the page signs in through the portal, so it only opens for someone
// with access to the class.
export const getAnswerLink = (sourceKey: string, questionId: string, studentUserId: string | number) => {
  const offering = ensureScheme(urlParam("offering"));
  const clazz = ensureScheme(urlParam("class"));
  const firebaseApp = urlParam("firebase-app");
  const answersSourceKey = urlParam("answersSourceKey");
  const params = new URLSearchParams();
  if (offering) {
    params.set("auth-domain", new URL(offering).origin);
  }
  if (firebaseApp) {
    params.set("firebase-app", firebaseApp);
  }
  params.set("sourceKey", sourceKey);
  params.set("iframeQuestionId", questionId);
  if (clazz) {
    params.set("class", clazz);
  }
  if (offering) {
    params.set("offering", offering);
  }
  params.set("studentId", String(studentUserId));
  if (answersSourceKey) {
    params.set("answersSourceKey", answersSourceKey);
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};
