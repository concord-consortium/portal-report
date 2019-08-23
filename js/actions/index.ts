import db from "../db";
import fakeSequenceStructure from "../data/sequence-structure.json";
import fakeAnswers from "../data/answers.json";
import {AnyAction, Dispatch} from "redux";
import { Map } from "immutable";
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
  API_FETCH_PORTAL_DATA_AND_AUTH_FIRESTORE
} from "../api-middleware";
import {requestRubric} from "./rubric";

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

type StateMap = Map<string, any>;

// When fetch succeeds, receivePortalData action will be called with the response object (json in this case).
// REQUEST_PORTAL_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function fetchAndObserveData() {
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

function receivePortalData(rawPortalData: IPortalRawData) {
  return (dispatch: Dispatch) => {
    dispatch({
      type: RECEIVE_PORTAL_DATA,
      response: rawPortalData
    });
    let resourceUrl = rawPortalData.offering.activity_url.toLowerCase();
    if (resourceUrl.match(/http:\/\/.*\.concord\.org/)) {
      // Ensure that CC LARA URLs always start with HTTPS. Teacher could have assigned HTTP version to a class long
      // time ago, but all the resources stored in Firestore assume that they're available under HTTPS now.
      // We can't replace all the HTTP protocols to HTTPS not to break dev environments.
      resourceUrl = resourceUrl.replace("http", "https");
    }
    const source = rawPortalData.sourceId;
    if (source === "fake.authoring.system") { // defined in data/offering-data.json
      // Use fake data.
      dispatch({
        type: RECEIVE_RESOURCE_STRUCTURE,
        response: fakeSequenceStructure,
      });
      dispatch({
        type: RECEIVE_ANSWERS,
        response: fakeAnswers,
      });
    } else {
      // Setup Firebase observer. It will fire each time the resource structure is updated.
      db.collection(`sources/${source}/resources`)
        .where("url", "==", resourceUrl)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            dispatch({
              type: RECEIVE_RESOURCE_STRUCTURE,
              response: snapshot.docs[0].data(),
            });
          }
        }, (err: Error) => {
          // tslint:disable-next-line no-console
          console.error("Firestore resource fetch error", err);
          dispatch(fetchError({
            status: 500,
            statusText: `Firestore resource fetch error: ${err.message}`
          }));
        });
      // Setup another Firebase observer, this time for answers.
      let answersQuery = db.collection(`sources/${source}/answers`)
        // This first where clause seems redundant, but it's necessary for Firestore auth rules to work fine
        // (they are based on context_id value).
        .where("context_id", "==", rawPortalData.contextId)
        .where("platform_id", "==", rawPortalData.platformId)
        .where("resource_link_id", "==", rawPortalData.offering.id.toString());
      if (rawPortalData.userType === "learner") {
        answersQuery = answersQuery.where("platform_user_id", "==", rawPortalData.platformUserId.toString());
      }
      answersQuery.onSnapshot(snapshot => {
        if (!snapshot.empty) {
          dispatch({
            type: RECEIVE_ANSWERS,
            response: snapshot.docs.map(doc => doc.data())
          });
        }
      }, fireStoreError(RECEIVE_ANSWERS, dispatch));
    }

    if (rawPortalData.userType === "teacher") {
      watchFireStoreReportSettings(rawPortalData, dispatch);
    }
    watchFirestoreFeedbackSettings(rawPortalData, dispatch);
    watchFirestoreQuestionFeedback(rawPortalData, dispatch);
    watchFirestoreActivityFeedback(rawPortalData, dispatch);
  };
}
function getResourceLink(rawPortalData: IPortalRawData) {
  return rawPortalData.offering.id.toString();
}

function fireStoreError(dispatchType: string, dispatch: Dispatch) {
  return (err: Error) => {
    // tslint:disable-next-line no-console
    console.error(err);
    dispatch(fetchError({
      status: 500,
      statusText: `Firestore ${dispatchType} fetch error: ${err.message}`
    }));
  };
}

function watchFireStoreReportSettings(rawPortalData: IPortalRawData, dispatch: Dispatch) {
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

function watchFirestoreFeedbackSettings(rawPortalData: IPortalRawData, dispatch: Dispatch) {
  const path = feedbackSettingsFirestorePath(rawPortalData.sourceId);
  let rubricRequested = false;
  db.collection(path)
    .where("contextId", "==", rawPortalData.contextId)
    .where("platformId", "==", rawPortalData.platformId)
    .where("resourceLinkId", "==", rawPortalData.resourceLinkId)
    .onSnapshot(snapshot => {
      if (!snapshot.empty) {
        dispatch({
          type: RECEIVE_FEEDBACK_SETTINGS,
          response: snapshot.docs[0].data()
        });
      }
      // Note that this should be called even if snapshot is empty (no feedback settings saved yet).
      if (!rubricRequested) {
        dispatch(requestRubric(rawPortalData.offering.rubric_url) as any as AnyAction);
        rubricRequested = true;
      }
    }, fireStoreError(RECEIVE_FEEDBACK_SETTINGS, dispatch));
}

function watchFirestoreQuestionFeedback(rawPortalData: IPortalRawData, dispatch: Dispatch) {
  const feedbackFireStorePath = reportQuestionFeedbacksFireStorePath(rawPortalData.sourceId);
  let feedbacksQuery = db.collection(feedbackFireStorePath)
    .where("platformId", "==", rawPortalData.platformId)
    .where("resourceLinkId", "==", rawPortalData.resourceLinkId);
  if (rawPortalData.userType === "learner") {
      feedbacksQuery = feedbacksQuery.where("platformStudentId", "==", rawPortalData.platformUserId.toString());
  } else {
      // "context_id" is theoretically redundant here, since we already filter by resource_link_id,
      // but that lets us use context_id value in the Firestore security rules.
      feedbacksQuery = feedbacksQuery.where("contextId", "==", rawPortalData.contextId);
  }
  feedbacksQuery.onSnapshot(snapshot => {
    if (!snapshot.empty) {
      dispatch({
        type: RECEIVE_QUESTION_FEEDBACKS,
        response: snapshot.docs.map(doc => doc.data())
      });
    }}, fireStoreError(RECEIVE_QUESTION_FEEDBACKS, dispatch)
  );
}

function watchFirestoreActivityFeedback(rawPortalData: IPortalRawData, dispatch: Dispatch) {
  const feedbackFireStorePath = reportActivityFeedbacksFireStorePath(rawPortalData.sourceId);
  let feedbacksQuery = db.collection(feedbackFireStorePath)
    .where("platformId", "==", rawPortalData.platformId)
    .where("resourceLinkId", "==", rawPortalData.resourceLinkId);
  if (rawPortalData.userType === "learner") {
      feedbacksQuery = feedbacksQuery.where("platformStudentId", "==", rawPortalData.platformUserId.toString());
  } else {
      // "context_id" is theoretically redundant here, since we already filter by resource_link_id,
      // but that lets us use context_id value in the Firestore security rules.
      feedbacksQuery = feedbacksQuery.where("contextId", "==", rawPortalData.contextId);
  }
  feedbacksQuery.onSnapshot(snapshot => {
    if (!snapshot.empty) {
      dispatch({
        type: RECEIVE_ACTIVITY_FEEDBACKS,
        response: snapshot.docs.map(doc => doc.data())
      });
    }}, fireStoreError(RECEIVE_ACTIVITY_FEEDBACKS, dispatch)
  );
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
    if (src.hasOwnProperty(key)) {
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
  return (dispatch: Dispatch, getState: () => StateMap) => {
    const questionsMap = getState().getIn(["report", "questions"]);
    // the questionsMap represents the previous state of the checkboxes
    // so the filter needs to special case the current key
    const selectedQuestionKeys = Array.from(questionsMap.values())
      .filter((q: StateMap) => q.get("id") === key ? value : q.get("selected"))
      .map((q: StateMap) => q.get("id"));
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

export function setNowShowing(value: boolean) {
  return {
    type: SET_NOW_SHOWING,
    value,
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
  return (dispatch: Dispatch, getState: () => StateMap) => {
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
