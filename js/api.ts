import * as firebase from "firebase";
import fetch from "isomorphic-fetch";
import * as jwt from "jsonwebtoken";
import  ClientOAuth2  from "client-oauth2";
import fakeOfferingData from "./data/offering-data.json";
import fakeClassData from "./data/small-class-data.json";
import { parseUrl, validFsId, urlParam, urlHashParam } from "./util/misc";
import { getActivityStudentFeedbackKey } from "./util/activity-feedback-helper";
import { getFirebaseAppName, signInWithToken } from "./db";
import migrate from "./core/rubric-migrations";
import { rubricUrlOverride } from "./util/debug-flags";

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
  userType: "teacher" | "learner" | "researcher";
  sourceKey: string;
  userId: string;
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
    user_id: string;
  };
}

// extract the hostname from the url
export const makeSourceKey = (url: string | null) => {
  return url ? parseUrl(url.toLowerCase()).hostname : "";
};

export const getSourceKey = (url: string): string => {
  const sourceKeyParam = urlParam("sourceKey");
  return sourceKeyParam || makeSourceKey(url);
};

// FIXME: If the user isn't logged in, and then they log in with a user that
// isn't the student being reported on then just a blank screen is shown
export const authorizeInPortal = (portalUrl: string, oauthClientName: string, state: string) => {
  const portalAuth = new ClientOAuth2({
    clientId: oauthClientName,
    redirectUri: window.location.origin + window.location.pathname,
    authorizationUri: `${portalUrl}${PORTAL_AUTH_PATH}`,
    state
  });
  // Redirect
  const redirectUri = `${window.location.protocol}//${portalAuth.token.getUri()}`;
  window.location.assign(redirectUri);
};

// Returns true if it is redirecting
export const initializeAuthorization = () => {
  const state = urlHashParam("state");
  accessToken = urlHashParam("access_token");

  if (accessToken && state) {
    const savedParamString = sessionStorage.getItem(state);
    window.history.pushState(null, "Portal Report", savedParamString);
  }
  else {
    const authDomain = urlParam("auth-domain");
    // Portal has to have AuthClient configured with this clientId.
    // The AuthClient has to have:
    // - redirect URLs of each branch being tested
    // - "client type" needs to be configured as 'public', to allow browser requests
    const oauthClientName = "portal-report";
    if (authDomain) {
      const key = Math.random().toString(36).substring(2,15);
      sessionStorage.setItem(key, window.location.search);
      authorizeInPortal(authDomain, oauthClientName, key);
      return true;
    }
  }

  return false;
};

export const getPortalBaseUrl = () => {
  const portalUrl = urlParam("class") || urlParam("offering");
  if (!portalUrl) {
    return null;
  }
  const { hostname, protocol } = parseUrl(portalUrl);
  return `${protocol}//${hostname}`;
};

export const getPortalFirebaseJWTUrl = (classHash: string, resourceLinkId: string | null, targetUserId: string | null, firebaseApp: string | undefined ) => {
  if(!firebaseApp){
    firebaseApp = getFirebaseAppName();
  }
  const baseUrl = getPortalBaseUrl();
  if (!baseUrl) {
    return null;
  }
  const researcher = urlParam("researcher") === "true";
  const resourceLinkParam = resourceLinkId ? `&resource_link_id=${resourceLinkId}` : "";
  const targetUserParam = targetUserId ? `&target_user_id=${targetUserId}` : "";
  return `${baseUrl}/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}${resourceLinkParam}${targetUserParam}${researcher ? "&researcher=true" : ""}`;
};

export function getAuthHeader() {
  if (urlParam("token")) {
    return `Bearer ${urlParam("token")}`;
  }
  if (accessToken) {
    return `Bearer ${accessToken}`;
  }
  throw new APIError("No token available to set auth header", { status: 0, statusText: "No token available to set auth header" });
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

export function fetchFirestoreJWT(classHash: string, resourceLinkId: string | null = null, targetUserId: string | null = null, firebaseApp?: string): Promise<{token: string}> {
  const firestoreJWTUrl = getPortalFirebaseJWTUrl(classHash, resourceLinkId, targetUserId, firebaseApp );
  if (firestoreJWTUrl) {
    return fetch(firestoreJWTUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then(response => response.json());
  } else {
    return new Promise(resolve => setTimeout(() => resolve({token: FAKE_FIRESTORE_JWT}), 250));
  }
}

export function fetchFirestoreJWTWithDefaultParams(firebaseApp?: string): Promise<{token: string}> {
  return Promise.all([fetchOfferingData(), fetchClassData()])
    .then(([offeringData, classData]) => {
      const resourceLinkId = offeringData.id.toString();
      const studentId = urlParam("studentId");
      // only pass resourceLinkId if there is a studentId
      // This could be a teacher or researcher viewing the report of a student
      // The studentId is sent in the firestore JWT request as the target_user_id
      return fetchFirestoreJWT(classData.class_hash, studentId ? resourceLinkId : null, studentId, firebaseApp);
    });
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
  const userType = urlParam("fakeUserType");
  if (userType === "teacher" || userType === "learner") {
    return userType;
  }
  return "teacher";
}

function fakeUserId() {
  const userType = urlParam("fakeUserType") || "learner";
  return `${userType}@fake.portal`;
}

export function fetchPortalDataAndAuthFirestore(): Promise<IPortalRawData> {
  const offeringPromise = fetchOfferingData();
  const classPromise = fetchClassData();
  return Promise.all([offeringPromise, classPromise]).then(([offeringData, classData]: [any, any]) => {
    const resourceLinkId = offeringData.id.toString();
    const studentId = urlParam("studentId");
    // only pass resourceLinkId if there is a studentId
    // This could be a teacher or researcher viewing the report of a student
    // The studentId is sent in the firestore JWT request as the target_user_id
    const firestoreJWTPromise = fetchFirestoreJWT(classData.class_hash, studentId ? resourceLinkId : null, studentId);
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
          sourceKey: getSourceKey(offeringData.activity_url),
          userId: verifiedFirebaseJWT.claims.user_id
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
          platformUserId: urlParam("fakePlatformUserId") || "1",
          contextId: classData.class_hash,
          // In most cases when using fake data the sourceKey param will be null
          // so the sourceKey will be based on the fake offeringData
          // and this offering data has a hostname of 'fake.authoring.system'
          sourceKey: getSourceKey(offeringData.activity_url),
          userId: fakeUserId()
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
// NOTE: this returns promise that might have 3 sub promises, so if this is
// used with a callApi successFunction it will have to deal with an array of
// parameters. Currently this is not used with a successFunction
export function updateFeedbackSettings(data: any, state: IStateReportPartial) {
  const { settings } = data;
  const promises: Promise<any>[] = [];

  // Then, send it to Firestore.
  settings.platformId = state.platformId;
  settings.resourceLinkId = state.resourceLinkId;
  // contextId is used by security rules.
  settings.contextId = state.contextId;
  const path = feedbackSettingsFirestorePath(state.sourceKey, {platformId: state.platformId, resourceLinkId: state.resourceLinkId});
  const firestorePromise = firebase.firestore()
    .doc(path)
    .set(settings, {merge: true});
  promises.push(firestorePromise);
  return Promise.all(promises);
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
  feedback.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
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
  const { activityId, platformStudentId, feedback } = data;
  // Send data to Firestore.
  const { platformId, platformUserId, resourceLinkId, contextId } = reportState;
  const activityStudentKey = getActivityStudentFeedbackKey(data);
  feedback.platformId = platformId;
  feedback.resourceLinkId = resourceLinkId;
  feedback.activityId = activityId;
  feedback.platformTeacherId = platformUserId;
  feedback.platformStudentId = platformStudentId;
  feedback.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  feedback.contextId = contextId;
  const path = reportActivityFeedbacksFireStorePath(reportState.sourceKey, activityStudentKey);
  return firebase.firestore()
      .doc(path)
      .set(feedback, {merge: true});
}

// The api-middleware calls this function when we need to load rubric in from a rubricUrl.
const rubricUrlCache: any = {};

export function fetchRubric(rubricUrl: string) {
  // check for override
  rubricUrl = rubricUrlOverride ?? rubricUrl;

  return new Promise((resolve, reject) => {
    if (!rubricUrlCache[rubricUrl]) {
      fetch(rubricUrl)
        .then(checkStatus)
        .then(response => response.json())
        .then(newRubric => {
          newRubric = migrate(newRubric);
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

// Extend the Error object so we can get stack traces
// NOTE: this doesn't work with instanceof checks extending builtin objects has
// to be handled specially by transpiliers and when doing that they break the
// way instanceof works
export class APIError extends Error{
  public response: IResponse;

  constructor(statusText: string, response: IResponse) {
    super(statusText);
    this.name = "APIError";
    this.response = response;
  }
}

export function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new APIError(response.statusText, response);
  }
}
