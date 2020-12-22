import * as firebase from "firebase";
import fetch from "isomorphic-fetch";
import * as jwt from "jsonwebtoken";
import  ClientOAuth2  from "client-oauth2";
import fakeOfferingData from "./data/offering-data.json";
import fakeClassData from "./data/small-class-data.json";
import { parseUrl, validFsId, urlParam, urlHashParam } from "./util/misc";
import { getActivityStudentFeedbackKey } from "./util/activity-feedback-helper";
import { FIREBASE_APP, signInWithToken } from "./db";

const PORTAL_AUTH_PATH = "/auth/oauth_authorize";
let accessToken: string | null = null;

const FAKE_FIRESTORE_JWT = "fake firestore JWT";

export interface ILTIPartial {
  platformId: string;      // portal
  platformUserId: string;
  contextId: string;       // class hash
  resourceLinkId: string;  // offering ID
}

export interface IStateAnswer {
  questionId: string;
  platformUserId: string;
  id: string;
}

export interface IStateReportPartial extends ILTIPartial {
  answers: {[key: string]: IStateAnswer};
  sourceKey: string;
}

export interface IPortalRawData extends ILTIPartial{
  offering: {
    id: number;
    activity_url: string;
    rubric_url: string;
  };
  classInfo: {
    id: number;
    name: string;
    students: IStudentRawData[];
  };
  userType: "teacher" | "learner";
  sourceKey: string;
}

export interface IStudentRawData {
  first_name: string;
  last_name: string;
  user_id: string;
}

export interface IResponse {
  url?: string;
  status: number;
  statusText: string;
}

export interface IFirebaseJWT {
  claims: {
    user_type: "teacher" | "learner";
    platform_id: string;
    platform_user_id: number;
  };
}

// This matches the make_source_key method in LARA's report_service.rb
function getSourceKey(): string | null {
  const toolId = urlParam("tool-id");

  return toolId ? toolId.replace(/https?:\/\/([^\/]+)/, "$1") : null;
}

export const authorizeInPortal = (portalUrl: string, oauthClientName: string, state: string) => {
  const portalAuth = new ClientOAuth2({
    clientId: oauthClientName,
    redirectUri: window.location.origin + window.location.pathname,
    authorizationUri: `${portalUrl}${PORTAL_AUTH_PATH}`,
    state
  });
  // Redirect
  window.location.assign(portalAuth.token.getUri());
};

export const initializeAuthorization = () => {
  const state = urlHashParam("state");
  accessToken = urlHashParam("access_token");

  if (accessToken && state) {
    const savedParamString = sessionStorage.getItem(state);
    window.history.pushState(null, "Portal Report", savedParamString);
  }
  else {
    const authDomain = urlParam("auth-domain");
    const oauthClientName = "token-service-example-app";
    if (authDomain) {
      const key = Math.random().toString(36).substring(2,15);
      sessionStorage.setItem(key, window.location.search);
      authorizeInPortal(authDomain, oauthClientName, key);
    }
  }
};

const getPortalBaseUrl = () => {
  const portalUrl = urlParam("class") || urlParam("offering");
  if (!portalUrl) {
    return null;
  }
  const { hostname, protocol } = parseUrl(portalUrl);
  return `${protocol}//${hostname}`;
};

export const getPortalFirebaseJWTUrl = (classHash: string, resourceLinkId: string | null, firebaseApp: string = FIREBASE_APP ) => {
  const baseUrl = getPortalBaseUrl();
  if (!baseUrl) {
    return null;
  }
  const resourceLinkParam = resourceLinkId ? `&resource_link_id=${resourceLinkId}` : "";
  return `${baseUrl}/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}${resourceLinkParam}`;
};

const gePortalReportAPIUrl = () => {
  const offeringUrl = urlParam("offering");
  if (offeringUrl) {
    // When this report is used an external report, it will be launched with offering URL parameter.
    // Modify this URL to point to get the deprecated Report API URL.
    return offeringUrl.replace("/offerings/", "/reports/");
  }
  return null;
};

export function getAuthHeader() {
  const fakeServer = "http://portal.test"; //used for testing
  if (urlParam("token")) {
    return `Bearer ${urlParam("token")}`;
  }
  if (accessToken) {
    return `Bearer ${accessToken}`;
  }
  throw new APIError("No token available", { status: 0, statusText: "No token available" });
}

export function fetchOfferingData() {
  const offeringUrl = urlParam("offering");
  if (offeringUrl) {
    return fetch(offeringUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then((response: Body) => response.json());
  } else {
    return new Promise(resolve => setTimeout(() => resolve(fakeOfferingData), 250));
  }
}

export function fetchClassData() {
  const classInfoUrl = urlParam("class");
  if (classInfoUrl) {
    return fetch(classInfoUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then(response => response.json());
  } else {
    return new Promise(resolve => setTimeout(() => resolve(fakeClassData), 250));
  }
}

export function fetchFirestoreJWT(classHash: string, resourceLinkId: string | null = null, firebaseApp?: string) {
  const firestoreJWTUrl = getPortalFirebaseJWTUrl(classHash, resourceLinkId, firebaseApp );
  if (firestoreJWTUrl) {
    return fetch(firestoreJWTUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then(response => response.json());
  } else {
    return new Promise(resolve => setTimeout(() => resolve({token: FAKE_FIRESTORE_JWT}), 250));
  }
}

export function authFirestore(rawFirestoreJWT: string) {
  const authResult = signInWithToken(rawFirestoreJWT) as Promise<firebase.auth.UserCredential | void>;
  return authResult.catch(err => {
    console.error("Firebase auth failed", err);
    throw new APIError("Firebase failed", {
      status: 401, // this will render nice error message that mentions authorization problems
      statusText: "Firebase authorization failed"
    });
  });
}

function fakeUserType(): "teacher" | "learner" {
  const userType = urlParam("fake-user-type");
  if (userType === "teacher" || userType === "learner") {
    return userType;
  }
  return "teacher";
}

export function fetchPortalDataAndAuthFirestore(): Promise<IPortalRawData> {
  const offeringPromise = fetchOfferingData();
  const classPromise = fetchClassData();
  return Promise.all([offeringPromise, classPromise]).then(([offeringData, classData]: [any, any]) => {
    const resourceLinkId = offeringData.id.toString();
    // only pass resourceLinkId if there is a studentId
    // FIXME: if this is a teacher viewing the report of a student there will be a studentId
    // but the token will be for a teacher, so then the resourceLinkId should be null
    const firestoreJWTPromise = fetchFirestoreJWT(classData.class_hash, urlParam("studentId") ? resourceLinkId : null);
    return firestoreJWTPromise.then((result: any) => {
      const rawFirestoreJWT = result.token;
      if (rawFirestoreJWT !== FAKE_FIRESTORE_JWT) {
        // We're not using fake data.
        const decodedFirebaseJWT = jwt.decode(rawFirestoreJWT);
        if (!decodedFirebaseJWT || typeof decodedFirebaseJWT === "string") {
          throw new APIError("Firebase JWT parsing error", {
            status: 500,
            statusText: "Firebase JWT parsing error"
          });
        }
        const verifiedFirebaseJWT = decodedFirebaseJWT as IFirebaseJWT;
        return authFirestore(rawFirestoreJWT).then(() => ({
          offering: offeringData,
          resourceLinkId,
          classInfo: classData,
          userType: verifiedFirebaseJWT.claims.user_type,
          platformId: verifiedFirebaseJWT.claims.platform_id,
          platformUserId: verifiedFirebaseJWT.claims.platform_user_id.toString(),
          contextId: classData.class_hash,
          sourceKey: getSourceKey() || parseUrl(offeringData.activity_url.toLowerCase()).hostname
          })
        );
      } else {
        // We're using fake data, including fake JWT.
        return {
          offering: offeringData,
          resourceLinkId: offeringData.id.toString(),
          classInfo: classData,
          userType: fakeUserType(),
          platformId: "https://fake.portal",
          platformUserId: "1",
          contextId: classData.class_hash,
          // In most cases when using fake data the SOURCE_KEY will be null
          // so the sourceKey will be based on the fake offeringData
          // and this offering data has a hostname of 'fake.authoring.system'
          sourceKey: getSourceKey() || parseUrl(offeringData.activity_url.toLowerCase()).hostname
        };
      }
    });
  });
}

export function reportSettingsFireStorePath(LTIData: ILTIPartial) {
  const {platformId, platformUserId, resourceLinkId} = LTIData;
  // Note this is similiar to the makeSourceKey function however in this case it is just
  // stripping off the protocol if there is one. It will also leave any trailing slashes.
  // It would be best to unify these two approaches. If makeSourceKey is changed then
  // the LARA make_source_key should be updated as well.
  const sourceKey = platformId.replace(/https?:\/\//, "");
  // NP: 2019-06-28 In the case of fake portal data we will return
  // `/sources/fake.portal/user_settings/1/offering/class123` which has
  // special FireStore Rules to allow universal read and write to that document.
  // Allows us to test limited report settings with fake portal data, sans JWT.
  // SC: 2019-11-12 this has been updated so the firestore network is disabled so these
  // fake user_settings should not be saved to or loaded from the actual firestore database
  return `/sources/${sourceKey}/user_settings/${validFsId(platformUserId)}/resource_link/${validFsId(resourceLinkId)}`;
}

// The updateReportSettings API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateReportSettings(update: any, state: ILTIPartial) {
  const path = reportSettingsFireStorePath(state);
  return firebase.firestore()
      .doc(path)
      .set(update, {merge: true});
}

// The updateReportSettings API middleware calls out to the deprecated Portal Report API.
// It's necessary to keep the Portal progress table valid and updated.
export function updateReportSettingsInPortal(data: any) {
  const reportUrl = gePortalReportAPIUrl();
  const authHeader = getAuthHeader();
  if (reportUrl) {
    return fetch(reportUrl, {
      method: "put",
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(checkStatus);
  } else {
    console.warn("No OFFERING/REPORT_URL. Faking put method.");
    return new Promise(resolve => resolve({}));
  }
}

export function feedbackSettingsFirestorePath(sourceKey: string, instanceParams?: { platformId?: string; resourceLinkId?: string }) {
  const path = `/sources/${sourceKey}/feedback_settings`;
  if (instanceParams) {
    return path + `/${validFsId(instanceParams.platformId + "-" + instanceParams.resourceLinkId)}`;
  }
  return path;
}

// The updateFeedbackSettings API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateFeedbackSettings(data: any, state: IStateReportPartial) {
  const { settings } = data;

  if (settings.activitySettings) {
    const { activityId, activityIndex } = data;
    const actSettings = settings.activitySettings[activityId];
    // Send data to Portal to keep progress table working. This is only one-way communication,
    // Portal Report never reads this data back from Portal.
    updateReportSettingsInPortal({
      activity_feedback_opts_v2: {
        enable_text_feedback: actSettings.textFeedbackEnabled,
        score_type: actSettings.scoreType,
        max_score: actSettings.maxScore,
        use_rubric: actSettings.useRubric,
        activity_index: activityIndex
      }
    });
  }
  if (settings.rubric) {
    updateReportSettingsInPortal({
      rubric_v2: {
        rubric: settings.rubric
      }
    });
  }

  // Then, send it to Firestore.
  settings.platformId = state.platformId;
  settings.resourceLinkId = state.resourceLinkId;
  // contextId is used by security rules.
  settings.contextId = state.contextId;
  const path = feedbackSettingsFirestorePath(state.sourceKey, {platformId: state.platformId, resourceLinkId: state.resourceLinkId});
  return firebase.firestore()
    .doc(path)
    .set(settings, {merge: true});
}

export function reportQuestionFeedbacksFireStorePath(sourceKey: string, answerId?: string) {
  // NP: 2019-06-28 In the case of fake portal data we will return
  // `/sources/fake.authoring.system/question_feedbacks/1/` which has
  // special FireStore Rules to allow universal read and write to that document.
  // Allows us to test limited report settings with fake portal data, without a JWT.
  // SC: 2019-11-12 this has been updated so the firestore network is disabled so these
  // fake question_feedbacks should not be saved to or loaded from the actual firestore database
  const path = `/sources/${sourceKey}/question_feedbacks`;
  if (answerId) {
    return path + `/${answerId}`;
  }
  return path;
}

export function reportActivityFeedbacksFireStorePath(sourceKey: string, activityUserKey?: string) {
  // NP: 2019-06-28 In the case of fake portal data we will return
  // `/sources/fake.authoring.system/question_feedbacks/1/` which has
  // special FireStore Rules to allow universal read and write to that document.
  // Allows us to test limited report settings with fake portal data, without a JWT.
  // SC: 2019-11-12 this has been updated so the firestore network is disabled so these
  // fake activity_feedbacks should not be saved to or loaded from the actual firestore database
  const path = `/sources/${sourceKey}/activity_feedbacks`;
  if (activityUserKey) {
    return path + `/${activityUserKey}`;
  }
  return path;
}

// The updateQuestionFeedbacks API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateQuestionFeedbacks(data: any, reportState: IStateReportPartial) {
  const { answerId, feedback } = data;
  const { platformId, platformUserId, resourceLinkId, contextId, answers } = reportState;
  feedback.platformId = platformId;
  feedback.resourceLinkId = resourceLinkId;
  feedback.answerId = answerId;
  feedback.questionId = answers[answerId].questionId;
  feedback.platformTeacherId = platformUserId;
  feedback.platformStudentId = answers[answerId].platformUserId;
  // contextId is used by security rules.
  feedback.contextId = contextId;
  const path = reportQuestionFeedbacksFireStorePath(reportState.sourceKey, answerId);
  return firebase.firestore()
      .doc(path)
      .set(feedback, {merge: true});
}

// The updateActivityFeedbacks API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateActivityFeedbacks(data: any, reportState: IStateReportPartial) {
  const { activityId, platformStudentId, feedback, activityIndex } = data;
  // Send data to Portal to keep progress table working. This is only one-way communication,
  // Portal Report never reads this data back from Portal.
  updateReportSettingsInPortal({
    activity_feedback_v2: {
      has_been_reviewed: feedback.hasBeenReviewed,
      text_feedback: feedback.feedback,
      score: feedback.score,
      rubric_feedback: feedback.rubricFeedback,
      activity_index: activityIndex,
      student_user_id: platformStudentId
    }
  });
  // Then, send it to Firestore.
  const { platformId, platformUserId, resourceLinkId, contextId } = reportState;
  const activityStudentKey = getActivityStudentFeedbackKey(data);
  feedback.platformId = platformId;
  feedback.resourceLinkId = resourceLinkId;
  feedback.activityId = activityId;
  feedback.platformTeacherId = platformUserId;
  feedback.platformStudentId = platformStudentId;
  feedback.contextId = contextId;
  const path = reportActivityFeedbacksFireStorePath(reportState.sourceKey, activityStudentKey);
  return firebase.firestore()
      .doc(path)
      .set(feedback, {merge: true});
}

// The api-middleware calls this function when we need to load rubric in from a rubricUrl.
const rubricUrlCache: any = {};

export function fetchRubric(rubricUrl: string) {
  return new Promise((resolve, reject) => {
    if (!rubricUrlCache[rubricUrl]) {
      fetch(rubricUrl)
        .then(checkStatus)
        .then(response => response.json())
        .then(newRubric => {
          rubricUrlCache[rubricUrl] = newRubric;
          resolve({ url: rubricUrl, rubric: newRubric });
        })
        .catch(e => {
          console.error(`unable to load rubric at: ${rubricUrl}`);
          reject(e);
        });
    } else {
      // Cache available, resolve promise immediately and return cached value.
      resolve({rubricUrl, rubric: rubricUrlCache[rubricUrl]});
    }
  });
}

export class APIError {
  public message: string;
  public response: IResponse;

  constructor(statusText: string, response: IResponse) {
    this.message = statusText;
    this.response = response;
  }
}

function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new APIError(response.statusText, response);
  }
}
