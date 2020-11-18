import { firestoreInitialized } from "../db";
import fakeSequenceStructure from "../data/sequence-structure.json";
// import fakeActivityStructure from "../data/activity-structure.json";
import fakeAnswers from "../data/answers.json";
// import fakeAnswers from "../data/average-class-activity-answers.json";
import {AnyAction, Dispatch} from "redux";
import {
  IPortalRawData,
  IResponse,
  reportSettingsFireStorePath,
  reportQuestionFeedbacksFireStorePath,
  reportActivityFeedbacksFireStorePath,
  feedbackSettingsFirestorePath,
} from "../api";
import {
  API_UPDATE_QUESTION_FEEDBACK,
  API_UPDATE_ACTIVITY_FEEDBACK,
  API_UPDATE_REPORT_SETTINGS,
  API_UPDATE_FEEDBACK_SETTINGS,
  API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE,
} from "../api-middleware";
import {requestRubric} from "./rubric";
// Get the Firestore type, I'd think there'd be a better way than this
import * as firebase from "firebase/app";
import "firebase/firestore";
import { RootState } from "../reducers";
import { urlParam } from "../util/misc";

export const SET_ANONYMOUS_VIEW = "SET_ANONYMOUS_VIEW";
export const REQUEST_PORTAL_DATA = "REQUEST_PORTAL_DATA";
export const RECEIVE_RESOURCE_STRUCTURE = "RECEIVE_RESOURCE_STRUCTURE";
export const RECEIVE_ANSWERS = "RECEIVE_ANSWERS";
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

// When fetch succeeds, receivePortalData action will be called with the response object (json in this case).
// REQUEST_PORTAL_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function fetchAndObserveData() {
  const runKeyValue = urlParam("runKey");
  if (runKeyValue) {
    const activity= urlParam("activity") || "";
    const source = activity? ((activity.split('/activities'))[0]).replace("https://","") : "";
    const answerSource = urlParam("answerSource") || "";
    return (dispatch: Dispatch, getState: any) => {
      dispatch( {
        type: SET_ANONYMOUS_VIEW,
        runKey: runKeyValue
      });
      firestoreInitialized.then(db => {
        watchResourceStructure(db, source, activity, dispatch);
        watchAnonymousAnswers(db, answerSource, runKeyValue, dispatch);
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
    firestoreInitialized.then(db => _receivePortalData(db, rawPortalData, dispatch));
  };
}

function _receivePortalData(db: firebase.firestore.Firestore,
                            rawPortalData: IPortalRawData, dispatch: Dispatch) {
  dispatch({
    type: RECEIVE_PORTAL_DATA,
    response: rawPortalData
  });
  let resourceUrl;
  if ((rawPortalData.offering.activity_url).includes("activity=")) {
    resourceUrl = decodeURIComponent(((rawPortalData.offering.activity_url?.split(".json")[0]).split("activity="))[1].replace("%2Fapi%2Fv1",""));
  } else {
    resourceUrl = rawPortalData.offering.activity_url.toLowerCase();
  }
  if (resourceUrl.match(/http:\/\/.*\.concord\.org/)) {
    // Ensure that CC LARA URLs always start with HTTPS. Teacher could have assigned HTTP version to a class long
    // time ago, but all the resources stored in Firestore assume that they're available under HTTPS now.
    // We can't replace all the HTTP protocols to HTTPS not to break dev environments.
    resourceUrl = resourceUrl.replace("http", "https");
  }
  const source = rawPortalData.sourceKey;
  if (source === "fake.authoring.system") { // defined in data/offering-data.json
    // Use fake data.
    dispatch({
      type: RECEIVE_RESOURCE_STRUCTURE,
      response: fakeSequenceStructure,
    });
    // dispatch({
    //   type: RECEIVE_RESOURCE_STRUCTURE,
    //   response: fakeActivityStructure,
    // });
    dispatch({
      type: RECEIVE_ANSWERS,
      response: fakeAnswers,
    });
  } else {
    watchResourceStructure(db, source, resourceUrl, dispatch);

    // Watch the Answers
    watchCollection(db, `sources/${source}/answers`, RECEIVE_ANSWERS,
      rawPortalData, dispatch);
  }

  if (rawPortalData.userType === "teacher") {
    watchFireStoreReportSettings(db, rawPortalData, dispatch);
  }
  watchFirestoreFeedbackSettings(db, rawPortalData, dispatch);

  const questionFeedbacksPath = reportQuestionFeedbacksFireStorePath(rawPortalData.sourceKey);
  watchCollection(db, questionFeedbacksPath, RECEIVE_QUESTION_FEEDBACKS,
    rawPortalData, dispatch);

  const activityFeedbacksPath = reportActivityFeedbacksFireStorePath(rawPortalData.sourceKey);
  watchCollection(db, activityFeedbacksPath, RECEIVE_ACTIVITY_FEEDBACKS,
    rawPortalData, dispatch);
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
    { resourceLinkId,
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
  const rubricUrl = rawPortalData.offering.rubric_url;
  let rubricRequested = false;
  const query = db.collection(path)
    .where("contextId", "==", rawPortalData.contextId)
    .where("platformId", "==", rawPortalData.platformId)
    .where("resourceLinkId", "==", rawPortalData.resourceLinkId);

  addSnapshotDispatchListener(query, RECEIVE_FEEDBACK_SETTINGS, dispatch,
    snapshot => snapshot.docs[0].data());

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

// Ugh the feedback system uses diffent keys than the answer system
// export this function so we can test it
export function correctKey(keyName: string, receiveMsg: string) {
  const feedbackKeys: IStringMap = {
    platform_id: "platformId",
    platform_user_id: "platformStudentId",
    resource_link_id: "resourceLinkId",
    context_id: "contextId"
  };

  switch (receiveMsg){
    case RECEIVE_QUESTION_FEEDBACKS:
    case RECEIVE_ACTIVITY_FEEDBACKS:
      return feedbackKeys[keyName];
    case RECEIVE_ANSWERS:
    default:
      return keyName;
  }
}

function watchCollection(db: firebase.firestore.Firestore, path: string, receiveMsg: string,
                         rawPortalData: IPortalRawData, dispatch: Dispatch) {
  let query = db.collection(path)
   .where(correctKey("platform_id", receiveMsg), "==", rawPortalData.platformId)
   .where(correctKey("resource_link_id", receiveMsg), "==", rawPortalData.resourceLinkId);
  if (rawPortalData.userType === "learner") {
     query = query.where(correctKey("platform_user_id", receiveMsg), "==",
       rawPortalData.platformUserId.toString());
  } else {
     // "context_id" is theoretically redundant here, since we already filter by resource_link_id,
     // but that lets us use context_id value in the Firestore security rules.
     query = query.where(correctKey("context_id", receiveMsg), "==", rawPortalData.contextId);
  }

  addSnapshotDispatchListener(query, receiveMsg, dispatch,
    snapshot => snapshot.docs.map(doc => doc.data()));
}

function watchAnonymousAnswers(db: firebase.firestore.Firestore, source: string, runKey: string, dispatch: Dispatch) {
// Setup Firebase observer. It will fire each time the resource structure is updated.
  const path = `sources/${source}/answers`;
  const query = db.collection(path)
    .where("run_key", "==", runKey);

  addSnapshotDispatchListener(query, RECEIVE_ANSWERS, dispatch,
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
  return {type: SET_ANSWER_SELECTED_FOR_COMPARE, id, value};
}

export function showCompareView(questionId: string) {
  return {type: SHOW_COMPARE_VIEW, questionId};
}

export function hideCompareView() {
  return {type: HIDE_COMPARE_VIEW};
}

export function showFeedbackView(embeddableKey: string) {
  return {type: SHOW_FEEDBACK, embeddableKey};
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

export function trackEvent(category: string, action: string, label: string) {
  return (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({
      type: TRACK_EVENT,
      category,
      action,
      label,
    });
    const clazzId = getState().getIn(["report", "clazzId"]);
    let labelText = "Class ID: " + clazzId + " - " + label;
    labelText = labelText.replace(/ - $/, "");
    (window as any).gtag("event", action, {event_category: category, event_label: labelText});
  };
}
