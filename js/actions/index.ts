import { getFirestore } from "../db";
import fakeSequenceStructure from "../data/sequence-structure.json";
import fakeActivityStructure from "../data/activity-structure.json";
import fakeAnswers from "../data/answers.json";
import fakeActivityAnswers from "../data/activity-answers.json";
import { AnyAction, Dispatch } from "redux";
import { Map } from "immutable";

import {
  IPortalRawData,
  IResponse,
  reportSettingsFireStorePath,
  reportQuestionFeedbacksFireStorePath,
  reportActivityFeedbacksFireStorePath,
  feedbackSettingsFirestorePath,
  getSourceKey
} from "../api";
import {
  API_UPDATE_QUESTION_FEEDBACK,
  API_UPDATE_ACTIVITY_FEEDBACK,
  API_UPDATE_REPORT_SETTINGS,
  API_UPDATE_FEEDBACK_SETTINGS,
  API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE,
} from "../api-middleware";
import { requestRubric } from "./rubric";
// Get the Firestore type, I'd think there'd be a better way than this
import * as firebase from "firebase/app";
import "firebase/firestore";
import { RootState } from "../reducers";
import { urlParam, getViewType, IFRAME_STANDALONE } from "../util/misc";
import queryString from "query-string";
import { v4 as uuid } from "uuid";
import { IReportItemAnswer, IReportItemHandlerMetadata, ReportItemsType } from "@concord-consortium/interactive-api-host";
import { disableRubric } from "../util/debug-flags";

export const SET_ANONYMOUS_VIEW = "SET_ANONYMOUS_VIEW";
export const REQUEST_PORTAL_DATA = "REQUEST_PORTAL_DATA";
export const RECEIVE_RESOURCE_STRUCTURE = "RECEIVE_RESOURCE_STRUCTURE";
export const RECEIVE_ANSWERS = "RECEIVE_ANSWERS";
export const RECEIVE_INTERACTIVE_STATE_HISTORIES = "RECEIVE_INTERACTIVE_STATE_HISTORIES";
export const RECEIVE_PORTAL_DATA = "RECEIVE_PORTAL_DATA";
export const RECEIVE_USER_SETTINGS = "RECEIVE_USER_SETTINGS";
export const RECEIVE_QUESTION_FEEDBACKS = "RECEIVE_QUESTION_FEEDBACKS";
export const RECEIVE_FEEDBACK_SETTINGS = "RECEIVE_FEEDBACK_SETTINGS";
export const RECEIVE_ACTIVITY_FEEDBACKS = "RECEIVE_ACTIVITY_FEEDBACKS";
export const FETCH_ERROR = "FETCH_ERROR";
export const SET_NOW_SHOWING = "SET_NOW_SHOWING";
export const SET_ANONYMOUS = "SET_ANONYMOUS";
export const SET_QUESTION_SELECTED = "SET_QUESTION_SELECTED";
export const HIDE_UNSELECTED_QUESTIONS = "HIDE_UNSELECTED_QUESTIONS";
export const SHOW_UNSELECTED_QUESTIONS = "SHOW_UNSELECTED_QUESTIONS";
export const SET_ANSWER_SELECTED_FOR_COMPARE = "SET_ANSWER_SELECTED_FOR_COMPARE";
export const SHOW_COMPARE_VIEW = "SHOW_COMPARE_VIEW";
export const HIDE_COMPARE_VIEW = "HIDE_COMPARE_VIEW";
export const SHOW_FEEDBACK = "SHOW_FEEDBACK";
export const UPDATE_ACTIVITY_FEEDBACK = "UPDATE_ACTIVITY_FEEDBACK";
export const TRACK_EVENT = "TRACK_EVENT";
export const API_CALL = "API_CALL";
export const REGISTER_REPORT_ITEM = "REGISTER_REPORT_ITEM";
export const UNREGISTER_REPORT_ITEM = "UNREGISTER_REPORT_ITEM";
export const GET_REPORT_ITEM_ANSWER = "GET_REPORT_ITEM_ANSWER";
export const SET_REPORT_ITEM_ANSWER = "SET_STUDENT_HTML";

export type TrackEventFunctionOptions = {label?: string; parameters?: any; skipGTag?: boolean; logEmptyLabel?: boolean};
export type TrackEventCategory = "Dashboard" | "Portal-Dashboard" | "Report";
export type TrackEventFunction = (category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) => any;

interface LogMessage {
  session: string;
  username: string;
  application: string;
  activity: string;
  event: string;
  time: number;
  parameters: any;
  event_value?: string;
  run_remote_endpoint?: string;
}

// When fetch succeeds, receivePortalData action will be called with the response object (json in this case).
// REQUEST_PORTAL_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function fetchAndObserveData() {
  const runKeyValue = urlParam("runKey");
  const _useFakeDataForTest = urlParam("_useFakeDataForTest");
  if (runKeyValue && !_useFakeDataForTest) {
    const activity = urlParam("activity") || "";
    const source = getSourceKey(activity);
    const answersSourceKey = urlParam("answersSourceKey") || source;
    return (dispatch: Dispatch, getState: any) => {
      dispatch({
        type: SET_ANONYMOUS_VIEW,
        runKey: runKeyValue
      });

      getFirestore().then(db => {
        if (activity) {
          watchResourceStructure(db, source, activity, dispatch);
        }
        else {
          // The network will be disabled in this case, see db.ts

          // Use fake data.
          dispatch({
            type: RECEIVE_RESOURCE_STRUCTURE,
            response: fakeSequenceStructure,
          });
        }
        watchAnonymousAnswers(db, answersSourceKey, runKeyValue, dispatch);
        watchAnonymousInteractiveStateHistories(db, answersSourceKey, runKeyValue, dispatch);
      });
    };
  } else {
    return {
      type: REQUEST_PORTAL_DATA,
      // Start with fetching portal data. It will cause other actions to be chained later.
      callAPI: {
        type: API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE,
        successAction: receivePortalData,
        errorAction: fetchError,
      },
    };
  }
}

function receivePortalData(rawPortalData: IPortalRawData) {
  return (dispatch: Dispatch) => {
    getFirestore().then(db => _receivePortalData(db, rawPortalData, dispatch));
  };
}

function _receivePortalData(db: firebase.firestore.Firestore,
  rawPortalData: IPortalRawData, dispatch: Dispatch) {
  dispatch({
    type: RECEIVE_PORTAL_DATA,
    response: rawPortalData
  });
  const resourceUrl = _getResourceUrl(rawPortalData.offering.activity_url);
  setLoggingVars(resourceUrl, rawPortalData);
  const source = rawPortalData.sourceKey;
  if (source === "fake.authoring.system") { // defined in data/offering-data.json
    // Use fake data. Default shows sequence fake resource and answer
    // resourceType query param allows for switching to show fake activity resource and answer
    if(urlParam("resourceType") === "activity") {
      dispatch({
        type: RECEIVE_RESOURCE_STRUCTURE,
        response: fakeActivityStructure,
      });
      dispatch({
        type: RECEIVE_ANSWERS,
        response: fakeActivityAnswers,
      });
      // TODO: dispatch fake interactive state histories
    } else {
      dispatch({
        type: RECEIVE_RESOURCE_STRUCTURE,
        response: fakeSequenceStructure,
      });
      dispatch({
        type: RECEIVE_ANSWERS,
        response: fakeAnswers,
      });
      // TODO: dispatch fake interactive state histories
    }
  } else {
    watchResourceStructure(db, source, resourceUrl, dispatch);

    // Watch the Answers
    const answersSourceKey = urlParam("answersSourceKey") || source;
    watchCollection(db, `sources/${answersSourceKey}/answers`, RECEIVE_ANSWERS,
      rawPortalData, dispatch);

    // watch the interactive state history (metadata, not full state)
    watchCollection(db, `sources/${answersSourceKey}/interactive_state_histories`, RECEIVE_INTERACTIVE_STATE_HISTORIES,
      rawPortalData, dispatch, (query) => query.orderBy("created_at", "asc"));
  }

  if (rawPortalData.userType === "teacher") {
    watchFireStoreReportSettings(db, rawPortalData, dispatch);
  }
  watchFirestoreFeedbackSettings(db, rawPortalData, dispatch);

  if (getViewType() !== IFRAME_STANDALONE) {
    // There's no point in downloading feedback in iframe standalone mode. First, it's never shown there.
    // Second, it'd cause errors related to insufficient permissions for answers shared between students,
    // as feedback is not meant to be shared and doesn't support explicit sharing.
    const questionFeedbacksPath = reportQuestionFeedbacksFireStorePath(rawPortalData.sourceKey);
    watchCollection(db, questionFeedbacksPath, RECEIVE_QUESTION_FEEDBACKS,
      rawPortalData, dispatch);

    const activityFeedbacksPath = reportActivityFeedbacksFireStorePath(rawPortalData.sourceKey);
    watchCollection(db, activityFeedbacksPath, RECEIVE_ACTIVITY_FEEDBACKS,
      rawPortalData, dispatch);
  }
}

function _getResourceUrl(activityUrl: string) {
  let resourceUrl;

  // This is to support reporting on activity player based external activities.
  // In those cases the offering.activity_url will look something like:
  // https://activity-player.concord.org?activity=https%3A%2F%2Fauthoring.concord.org%2Fapi%2Fv1%2Factivities%2F123.json
  // or in the case of a sequence, something like:
  // https://activity-player.concord.org?sequence=https%3A%2F%2Fauthoring.concord.org%2Fapi%2Fv1%2Fsequences%2F125.json
  const activityUrlParts = queryString.parseUrl(activityUrl);
  const activityUrlActivityParam = activityUrlParts.query.activity || activityUrlParts.query.sequence;
  if (activityUrlActivityParam && typeof activityUrlActivityParam === "string" ) {
    // The activity param of an activity-player url points to a /api/v1/activities/123.json
    // However the activity structure is stored in the report service using its canonical url of /activites/123
    resourceUrl = activityUrlActivityParam.replace("/api/v1", "").replace(".json", "");
  } else {
    resourceUrl = activityUrl.toLowerCase();
  }

  if (resourceUrl.match(/http:\/\/.*\.concord\.org/)) {
    // Ensure that CC LARA URLs always start with HTTPS. Teacher could have assigned HTTP version to a class long
    // time ago, but all the resources stored in Firestore assume that they're available under HTTPS now.
    // We can't replace all the HTTP protocols to HTTPS not to break dev environments.
    resourceUrl = resourceUrl.replace("http", "https");
  }

  return resourceUrl;
}

function getResourceLink(rawPortalData: IPortalRawData) {
  return rawPortalData.offering.id.toString();
}

function fireStoreError(dispatchType: string, dispatch: Dispatch) {
  return (err: Error) => {
    console.error(dispatchType, err);
    dispatch(fetchError({
      status: 500,
      statusText: `Firestore ${dispatchType} fetch error: ${err.message}`
    }));
  };
}

type SnapshotHandler = (snapshot: firebase.firestore.QuerySnapshot) => any;

function addSnapshotDispatchListener(query: firebase.firestore.Query, receiveMsg: string,
  dispatch: Dispatch,
  handler: SnapshotHandler) {
  query.onSnapshot(snapshot => {
    if (!snapshot.empty) {
      dispatch({
        type: receiveMsg,
        response: handler(snapshot)
      });
    }
  }, fireStoreError(receiveMsg, dispatch));
}

function watchResourceStructure(db: firebase.firestore.Firestore,
  source: string, resourceUrl: string, dispatch: Dispatch) {
  // Setup Firebase observer. It will fire each time the resource structure is updated.
  const query = db.collection(`sources/${source}/resources`)
    .where("url", "==", resourceUrl);
  addSnapshotDispatchListener(query, RECEIVE_RESOURCE_STRUCTURE, dispatch,
    snapshot => snapshot.docs[0].data());
}

function watchFireStoreReportSettings(db: firebase.firestore.Firestore, rawPortalData: IPortalRawData, dispatch: Dispatch) {
  // Create Firestore document observer for settings:
  const resourceLinkId = getResourceLink(rawPortalData);
  const settingsFileStorePath = reportSettingsFireStorePath(
    {
      resourceLinkId,
      contextId: rawPortalData.contextId,
      platformId: rawPortalData.platformId,
      platformUserId: rawPortalData.platformUserId
    }
  );
  db.doc(settingsFileStorePath)
    .onSnapshot(
      (snapshot: any) => {
        dispatch({
          type: RECEIVE_USER_SETTINGS,
          response: snapshot.data()
        });
      },
      fireStoreError(RECEIVE_USER_SETTINGS, dispatch)
    );
}

function watchFirestoreFeedbackSettings(db: firebase.firestore.Firestore, rawPortalData: IPortalRawData, dispatch: Dispatch) {
  const path = feedbackSettingsFirestorePath(rawPortalData.sourceKey);
  let rubricUrl: string|null = rawPortalData.offering.rubric_url;
  let rubricRequested = false;
  const query = db.collection(path)
    .where("contextId", "==", rawPortalData.contextId)
    .where("platformId", "==", rawPortalData.platformId)
    .where("resourceLinkId", "==", rawPortalData.resourceLinkId);

  addSnapshotDispatchListener(query, RECEIVE_FEEDBACK_SETTINGS, dispatch,
    snapshot => snapshot.docs[0].data());

  // see the readme for how disableRubric is set with a query param for development/debugging
  if (disableRubric) {
    rubricUrl = null;
  }

  // Unlike the listener added above, this should be called even if snapshot is empty
  // (no feedback settings saved yet).
  query.onSnapshot(snapshot => {
    if (rubricUrl && !rubricRequested) {
      dispatch(requestRubric(rubricUrl) as any as AnyAction);
      rubricRequested = true;
    }
  });
}

interface IStringMap {
  [key: string]: string;
}

// Ugh the feedback system uses different keys than the answer system
// export this function so we can test it
export function correctKey(keyName: string, receiveMsg: string) {
  const feedbackKeys: IStringMap = {
    platform_id: "platformId",
    platform_user_id: "platformStudentId",
    resource_link_id: "resourceLinkId",
    context_id: "contextId",
    shared_with: "sharedWith"
  };

  switch (receiveMsg) {
    case RECEIVE_QUESTION_FEEDBACKS:
    case RECEIVE_ACTIVITY_FEEDBACKS:
      return feedbackKeys[keyName];
    case RECEIVE_ANSWERS:
    case RECEIVE_INTERACTIVE_STATE_HISTORIES:
    default:
      return keyName;
  }
}

function watchCollection(db: firebase.firestore.Firestore, path: string, receiveMsg: string,
  rawPortalData: IPortalRawData, dispatch: Dispatch, filterQuery?: (query: firebase.firestore.Query) => firebase.firestore.Query) {
  let query = db.collection(path)
    .where(correctKey("platform_id", receiveMsg), "==", rawPortalData.platformId)
    .where(correctKey("resource_link_id", receiveMsg), "==", rawPortalData.resourceLinkId);
  if (rawPortalData.userType === "learner") {
    const studentId = urlParam("studentId");
    if (studentId && rawPortalData.platformUserId.toString() !== studentId) {
      // If studentId URL param is provided, and it's different than logged in student platformUserId, it means that
      // a student is trying to see another student's work. This should be allowed only if context is matching
      // and answers have been explicitly shared with the class.
      query = query.where(correctKey("context_id", receiveMsg), "==", rawPortalData.contextId);
      query = query.where(correctKey("platform_user_id", receiveMsg), "==", studentId); // another student work!
      query = query.where(correctKey("shared_with", receiveMsg), "==", "context"); // explicitly shared with a class (context)
    } else {
      // In this case, student is just looking at his own work.
      query = query.where(correctKey("platform_user_id", receiveMsg), "==", rawPortalData.platformUserId.toString());
    }
  } else {
    // "context_id" is theoretically redundant here, since we already filter by resource_link_id,
    // but that lets us use context_id value in the Firestore security rules.
    query = query.where(correctKey("context_id", receiveMsg), "==", rawPortalData.contextId);

    // If there is a studentId url param add that as a platform_user_id filter too
    // This optimizes the query when looking at a single student
    // It is also necessary when a researcher is looking at a single student's data
    const studentId = urlParam("studentId");
    if (studentId) {
      query = query.where(correctKey("platform_user_id", receiveMsg), "==", studentId);
    }
  }

  if (filterQuery) {
    query = filterQuery(query);
  }

  addSnapshotDispatchListener(query, receiveMsg, dispatch,
    snapshot => snapshot.docs.map(doc => doc.data()));
}

function watchAnonymousAnswers(db: firebase.firestore.Firestore, source: string, runKey: string, dispatch: Dispatch) {
  // Setup Firebase observer. It will fire each time the answer is updated.
  const path = `sources/${source}/answers`;
  const query = db.collection(path)
    .where("run_key", "==", runKey);

  addSnapshotDispatchListener(query, RECEIVE_ANSWERS, dispatch,
    snapshot => snapshot.docs.map(doc => doc.data()));
}

function watchAnonymousInteractiveStateHistories(db: firebase.firestore.Firestore, source: string, runKey: string, dispatch: Dispatch) {
  // Setup Firebase observer. It will fire each time the interactive state history is updated.
  const path = `sources/${source}/interactive_state_histories`;
  const query = db.collection(path)
    .where("run_key", "==", runKey);

  addSnapshotDispatchListener(query, RECEIVE_INTERACTIVE_STATE_HISTORIES, dispatch,
    snapshot => snapshot.docs.map(doc => doc.data()));
}

function fetchError(response: IResponse) {
  return {
    type: FETCH_ERROR,
    response,
  };
}

function mappedCopy(src: any, fieldMappings: any) {
  const dst: any = {};
  let dstKey;
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      dstKey = fieldMappings[key] || key;
      // remove undefined values;
      if (src[key] !== undefined) {
        dst[dstKey] = src[key];
      }
    }
  }
  return dst;
}

export function setQuestionSelected(key: string, value: boolean) {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const questionsMap = getState().getIn(["report", "questions"]);
    // the questionsMap represents the previous state of the checkboxes
    // so the filter needs to special case the current key
    // Note: questionsMap.valueSeq().toArray() was Array.from(questionsMap.values())
    // but Typescript prefers this, even though it probably runs through the array twice...
    const selectedQuestionKeys = questionsMap.valueSeq().toArray()
      .filter((q) => q.get("id") === key ? value : q.get("selected"))
      .map((q) => q.get("id"));
    dispatch({
      type: SET_QUESTION_SELECTED,
      key,
      value,
      // Send data to server. Don't care about success or failure. See: api-middleware.js
      callAPI: {
        type: API_UPDATE_REPORT_SETTINGS,
        data: {
          visibility_filter: {
            questions: selectedQuestionKeys,
          },
        },
      },
    });
  };
}

export function hideUnselectedQuestions() {
  return (dispatch: Dispatch) => {
    dispatch({
      type: HIDE_UNSELECTED_QUESTIONS,
      // Send data to server. Don't care about success or failure. See: api-middleware.js
      callAPI: {
        type: API_UPDATE_REPORT_SETTINGS,
        data: {
          visibility_filter: {
            active: true,
          },
        },
      },
    });
  };
}

export function showUnselectedQuestions() {
  return {
    type: SHOW_UNSELECTED_QUESTIONS,
    // Send data to server. Don't care about success or failure. See: api-middleware.js
    callAPI: {
      type: API_UPDATE_REPORT_SETTINGS,
      data: {
        visibility_filter: {
          active: false,
        },
      },
    },
  };
}

export function setNowShowing(nowShowingValue: boolean, selectedStudentIds?: string[]) {
  return {
    type: SET_NOW_SHOWING,
    nowShowingValue,
    selectedStudentIds
  };
}

export function setAnonymous(value: boolean) {
  return {
    type: SET_ANONYMOUS,
    value,
    // Send data to server. Don't care about success or failure. See: api-middleware.js
    callAPI: {
      type: API_UPDATE_REPORT_SETTINGS,
      data: {
        anonymous_report: value,
      },
    },
  };
}

export function setAnswerSelectedForCompare(id: string, value: boolean) {
  return { type: SET_ANSWER_SELECTED_FOR_COMPARE, id, value };
}

export function showCompareView(questionId: string) {
  return { type: SHOW_COMPARE_VIEW, questionId };
}

export function hideCompareView() {
  return { type: HIDE_COMPARE_VIEW };
}

export function showFeedbackView(embeddableKey: string) {
  return { type: SHOW_FEEDBACK, embeddableKey };
}

export function updateQuestionFeedback(answerId: string, feedback: any) {
  const feedbackData = mappedCopy(feedback, {});
  return {
    type: API_CALL,
    callAPI: {
      type: API_UPDATE_QUESTION_FEEDBACK,
      errorAction: fetchError,
      data: {
        feedback: feedbackData,
        answerId
      },
    }
  };
}

export function updateActivityFeedback(activityId: string, activityIndex: number, platformStudentId: string, feedback: any) {
  const feedbackData = mappedCopy(feedback, {});
  return {
    type: API_CALL,
    callAPI: {
      type: API_UPDATE_ACTIVITY_FEEDBACK,
      errorAction: fetchError,
      data: {
        feedback: feedbackData,
        activityId,
        platformStudentId,
        activityIndex
      },
    },
  };
}

export function updateQuestionFeedbackSettings(questionId: string, settings: any) {
  return {
    type: API_CALL,
    callAPI: {
      type: API_UPDATE_FEEDBACK_SETTINGS,
      errorAction: fetchError,
      data: {
        settings: {
          questionSettings: {
            [questionId]: settings
          }
        }
      }
    }
  };
}

export function updateActivityFeedbackSettings(activityId: string, activityIndex: number, settings: any) {
  return {
    type: API_CALL,
    callAPI: {
      type: API_UPDATE_FEEDBACK_SETTINGS,
      errorAction: fetchError,
      data: {
        settings: {
          activitySettings: {
            [activityId]: settings
          }
        },
        activityId,
        activityIndex
      }
    }
  };
}

export function saveRubric(rubricContent: any) {
  return {
    type: API_CALL,
    callAPI: {
      type: API_UPDATE_FEEDBACK_SETTINGS,
      errorAction: fetchError,
      data: {
        settings: {
          rubric: rubricContent
        }
      }
    }
  };
}

// default logging to staging, this is updated after receiving the portal info
let logManagerUrl = "https://logger.concordqa.org/logs";
let loggingActivity = "n/a";
let loggingContextId = "n/a";
let loggingClassId = 0;
let loggingIsSequence = false;
const loggingSession = uuid();
const parsedQuery = queryString.parseUrl(window.location.toString()).query;
let loggingEnabled = parsedQuery.logging === "true";
const debugLogging = parsedQuery.debugLogging === "true";

export function setLoggingVars(resourceUrl: string, rawPortalData: IPortalRawData) {
  const match = resourceUrl.match(/\/(activities|sequences)\/(\d+)/);
  if (match) {
    const type = match[1] === "activities" ? "activity" : "sequence";
    loggingActivity = `${type}: ${match[2]}`;
    loggingContextId = rawPortalData.contextId;
    loggingClassId = rawPortalData.classInfo.id;
    loggingIsSequence = match[1] === "sequences";

    // use production log manager on production portals
    logManagerUrl = /(learn|portal)\.concord\.org/.test(rawPortalData.platformId)
      ? "https://logger.concord.org/logs"
      : "https://logger.concordqa.org/logs";
  }

  // return these values for tests
  return {
    loggingActivity,
    loggingContextId,
    loggingClassId,
    logManagerUrl
  };
}

let loggingClassName: string | null = null;
let loggingSequenceName: string | null = null;
let loggingCurrentActivityName: string | null = null;
export function setExtraEventLoggingParameters(options: {className: string; sequenceName: string | null; currentActivityName: string | null}) {
  loggingClassName = options.className;
  loggingSequenceName = options.sequenceName;
  loggingCurrentActivityName = options.currentActivityName;
}

// used by tests to enable/disable logging
export function enableLogging(enable: boolean) {
  loggingEnabled = enable;
}

export function trackEvent(category: TrackEventCategory, action: string, options?: TrackEventFunctionOptions) {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const label = options?.label || "";
    dispatch({
      type: TRACK_EVENT,
      category,
      action,
      label,
    });

    if (!options?.skipGTag) {
      const clazzId = getState().getIn(["report", "clazzId"]);
      let labelText = "Class ID: " + clazzId + " - " + label;
      labelText = labelText.replace(/ - $/, "");
      (window as any).gtag("event", action, { event_category: category, event_label: labelText });
    }

    if (loggingEnabled) {
      const parameters = options?.parameters || {};
      parameters.contextId = loggingContextId;
      parameters.classId = loggingClassId;
      if (loggingClassName !== null) {
        parameters.className = loggingClassName;
      }
      if (loggingIsSequence && (loggingSequenceName !== null)) {
        parameters.sequenceName = loggingSequenceName;
      }
      if (loggingCurrentActivityName !== null) {
        // events can override the activity name
        parameters.activityName = parameters.activityName || loggingCurrentActivityName;
      }

      const logMessage: LogMessage = {
        session: loggingSession,
        username: getState().getIn(["report", "loggingUserName"]),
        application: "portal-report",
        activity: loggingActivity,
        event: action,
        time: Date.now(),
        parameters,
        event_value: options?.label,
      };

      // log nothing for empty event labels unless logEmptyLabel option is enabled
      if (logMessage.event_value === "" && !options?.logEmptyLabel) {
        logMessage.event_value = undefined;
      }

      // NOTE: run_remote_endpoint is not logged as currently we are only logging teacher dashboard events which
      // do not have a run_remote_endpoint to log.

      if (debugLogging) {
        console.log("Logging [DEBUG]: sent", JSON.stringify(logMessage), "to", logManagerUrl);  // eslint-disable-line
      }

      const request = new XMLHttpRequest();
      request.open("POST", logManagerUrl, true);
      request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      request.send(JSON.stringify(logMessage));
    }
  };
}

export function registerReportItem(questionId: string, iframePhone: any, reportItemMetadata: IReportItemHandlerMetadata) {
  return {
    type: REGISTER_REPORT_ITEM,
    questionId,
    iframePhone,
    reportItemMetadata
  };
}

export function unregisterReportItem(questionId: string) {
  return {
    type: UNREGISTER_REPORT_ITEM,
    questionId
  };
}

export function getReportItemAnswer(answer: Map<string, any>, itemsType: ReportItemsType) {
  return {
    type: GET_REPORT_ITEM_ANSWER,
    answer,
    itemsType
  };
}

export function setReportItemAnswer(answer: Map<string, any>, reportItemAnswer: IReportItemAnswer) {
  return {
    type: SET_REPORT_ITEM_ANSWER,
    answer,
    reportItemAnswer
  };
}
