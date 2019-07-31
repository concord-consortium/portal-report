import * as firebase from "firebase";
import fetch from "isomorphic-fetch";
import * as jwt from "jsonwebtoken";
import fakeOfferingData from "./data/offering-data.json";
import fakeClassData from "./data/class-data.json";
import queryString from "query-string";
import { parseUrl } from "./util/misc";
import humps from "humps";
import * as db from "./db";

const FIREBASE_APP = "report-service-dev";
const FAKE_FIRESTORE_JWT = "fake firestore JWT";

export interface ILTIPartial {
  platformId: string;      // portal
  platformUserId: string;
  contextId: string;       // class hash
  resourceLinkId: string;  // offering ID
}

export interface IStateAnswer {
  questionId: string;
  id: string;
}

export interface IStateReportPartial extends ILTIPartial {
  answers: {[key: string]: IStateAnswer};
  sourceId: string;
}

export interface IPortalRawData extends ILTIPartial{
  offering: {
    id: number,
    activity_url: string;
  };
  classInfo: {
    id: number;
    name: string;
    students: IStudentRawData[];
  };
  userType: "teacher" | "learner";
  sourceId: string;
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

const urlParam = (name: string): string | null => {
  const result = queryString.parse(window.location.search)[name];
  if (typeof result === "string") {
    return result;
  } else if (result && result.length) {
    return result[0];
  } else {
    return null;
  }
};

const getPortalBaseUrl = () => {
  const portalUrl = urlParam("class") || urlParam("offering");
  if (!portalUrl) {
    return null;
  }
  const { hostname, protocol } = parseUrl(portalUrl);
  return `${protocol}//${hostname}/`;
};

const getPortalFirebaseJWTUrl = (classHash: string) => {
  const baseUrl = getPortalBaseUrl();
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}/api/v1/jwt/firebase?firebase_app=${FIREBASE_APP}&class_hash=${classHash}`;
};

const getAuthHeader = () => `Bearer ${urlParam("token")}`;

// Returns path that only includes allowed Firestore characters.
// Firestore docs say:
// Must be valid UTF-8 characters
// Must be no longer than 1,500 bytes
// Cannot contain a forward slash (/)
// Cannot solely consist of a single period (.) or double periods (..)
// Cannot match the regular expression __.*__
const validFsId = (anyPath: string) => {
  const safeCharacter = "%";
  return anyPath
    .replace(/\//g, safeCharacter)
    .replace(/\.\./g, safeCharacter)
    .replace(/__/g, safeCharacter);
};

export function fetchOfferingData() {
  const offeringUrl = urlParam("offering");
  if (offeringUrl) {
    return fetch(offeringUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then((response: Body)  => response.json());
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

export function fetchFirestoreJWT(classHash: string) {
  const firestoreJWTUrl = getPortalFirebaseJWTUrl(classHash);
  if (firestoreJWTUrl) {
    return fetch(firestoreJWTUrl, {headers: {Authorization: getAuthHeader()}})
      .then(checkStatus)
      .then(response => response.json());
  } else {
    return new Promise(resolve => setTimeout(() => resolve({token: FAKE_FIRESTORE_JWT}), 250));
  }
}

export function authFirestore(rawFirestoreJWT: string) {
  return db.signInWithToken(rawFirestoreJWT).catch(err => {
    // tslint:disable-next-line no-console
    console.error("Firebase auth failed", err);
    throw new APIError("Firebase failed", {
      status: 401, // this will render nice error message that mentions authorization problems
      statusText: "Firebase authorization failed"
    });
  });
}

export function fetchPortalDataAndAuthFirestore(): Promise<IPortalRawData> {
  const offeringPromise = fetchOfferingData();
  const classPromise = fetchClassData();
  return classPromise.then(classData => {
    const firestoreJWTPromise = fetchFirestoreJWT(classData.class_hash);
    return Promise.all([offeringPromise, firestoreJWTPromise]).then(result => {
      const offeringData = result[0];
      const rawFirestoreJWT = result[1].token;
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
            resourceLinkId: offeringData.id.toString(),
            classInfo: classData,
            userType: verifiedFirebaseJWT.claims.user_type,
            platformId: verifiedFirebaseJWT.claims.platform_id,
            platformUserId: verifiedFirebaseJWT.claims.platform_user_id.toString(),
            contextId: classData.class_hash,
            sourceId: parseUrl(offeringData.activity_url.toLowerCase()).hostname
          })
        );
      } else {
        // We're using fake data, including fake JWT.
        return {
          offering: offeringData,
          resourceLinkId: offeringData.id.toString(),
          classInfo: classData,
          userType: "teacher",
          platformId: "https://fake.portal",
          platformUserId: "1",
          contextId: classData.class_hash,
          sourceId: parseUrl(offeringData.activity_url.toLowerCase()).hostname
        };
      }
    });
  });
}

export function reportSettingsFireStorePath(LTIData: ILTIPartial) {
  const {platformId, platformUserId, resourceLinkId} = LTIData;
  const sourceId = platformId.replace(/https?:\/\//, "");
  // NP: 2019-06-28 In the case of fake portal data we will return
  // `/sources/fake.portal/user_settings/1/offering/class123` which has
  // special FireStore Rules to allow universal read and write to that document.
  // Allows us to test limited report settings with fake portal data, sans JWT.
  return `/sources/${sourceId}/user_settings/${validFsId(platformUserId)}/resource_link/${validFsId(resourceLinkId)}`;
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

export function feedbackSettingsFirestorePath(sourceId: string, instanceParams?: { platformId?: string, resourceLinkId?: string }) {
  const path = `/sources/${sourceId}/feedback_settings`;
  if (instanceParams) {
    return path + `/${validFsId(instanceParams.platformId + "-" + instanceParams.resourceLinkId)}`;
  }
  return path;
}

// The updateQuestionFeedbackSettings API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateFeedbackSettings(data: {questionId?: string, activityId?: string, settings: any}, state: IStateReportPartial) {
  const { questionId, activityId, settings } = data;
  let finalData: any;
  // Depending what's provided as an argument, we'll either update question settings or activity setting.
  if (questionId !== undefined) {
    finalData = { questionSettings: { [questionId]: settings } };
  } else if (activityId) {
    finalData = { activitySettings: { [activityId]: settings } };
  }
  finalData.platformId = state.platformId;
  finalData.resourceLinkId = state.resourceLinkId;
  // contextId is used by security rules.
  finalData.contextId = state.contextId;
  const path = feedbackSettingsFirestorePath(state.sourceId, {platformId: state.platformId, resourceLinkId: state.resourceLinkId});
  return firebase.firestore()
    .doc(path)
    .set(finalData, {merge: true});
}

export function reportQuestionFeedbacksFireStorePath(sourceId: string, answerId?: string) {
  // NP: 2019-06-28 In the case of fake portal data we will return
  // `/sources/fake.authoring.system/question_feedbacks/1/` which has
  // special FireStore Rules to allow universal read and write to that document.
  // Allows us to test limited report settings with fake portal data, without a JWT.
  const path = `/sources/${sourceId}/question_feedbacks`;
  if (answerId) {
    return path + `/${answerId}`;
  }
  return path;
}

// The updateReportSettings API middleware calls out to the FireStore API.
// `firestore().path().set()` returns a Promise that will resolve immediately.
// This due to a feature in the FireStore API called "latency compensation."
// See: https://firebase.google.com/docs/firestore/query-data/listen
export function updateQuestionFeedbacks(data: any, reportState: IStateReportPartial) {
  const { answerId, feedback } = data;
  const { platformId, platformUserId, resourceLinkId, contextId, answers } = reportState;
  feedback.platformId = platformId;
  feedback.platformUserId = platformUserId;
  feedback.resourceLinkId = resourceLinkId;
  feedback.questionId = answers[answerId].questionId;
  feedback.answerId = answerId;
  // contextId is used by security rules.
  feedback.contextId = contextId;
  const path = reportQuestionFeedbacksFireStorePath(reportState.sourceId, answerId);
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
          // tslint:disable-next-line:no-console
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
