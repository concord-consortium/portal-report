import db from "../db";
import { parseUrl } from "../util/misc";
import fakeSequenceStructure from "../data/sequence-structure.json";
import fakeAnswers from "../data/answers.json";
import {Dispatch} from "redux";
import { Map } from "immutable";
import { IPortalRawData, IResponse } from "../api";

export const REQUEST_PORTAL_DATA = "REQUEST_PORTAL_DATA";
export const RECEIVE_RESOURCE_STRUCTURE = "RECEIVE_RESOURCE_STRUCTURE";
export const RECEIVE_ANSWERS = "RECEIVE_ANSWERS";
export const RECEIVE_PORTAL_DATA = "RECEIVE_PORTAL_DATA";
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
export const UPDATE_FEEDBACK = "UPDATE_FEEDBACK";
export const ENABLE_FEEDBACK = "ENABLE_FEEDBACK";
export const UPDATE_ACTIVITY_FEEDBACK = "UPDATE_ACTIVITY_FEEDBACK";
export const ENABLE_ACTIVITY_FEEDBACK = "ENABLE_ACTIVITY_FEEDBACK";
export const TRACK_EVENT = "TRACK_EVENT";

type StateMap = Map<string, any>;

// When fetch succeeds, receivePortalData action will be called with the response object (json in this case).
// REQUEST_PORTAL_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function fetchAndObserveData() {
  return {
    type: REQUEST_PORTAL_DATA,
    // Start with fetching portal data. It will cause other actions to be chained later.
    callAPI: {
      type: "fetchPortalDataAndAuthFirestore",
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
    const resourceUrl = rawPortalData.offering.activity_url;
    const source = parseUrl(resourceUrl).hostname.replace(/\./g, "_");
    if (source === "fake_authoring_system") { // defined in data/offering-data.json
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
      const classHash = rawPortalData.classInfo.class_hash;
      db.collection(`sources/${source}/answers`)
        .where("resource_url", "==", resourceUrl)
        .where("class_hash", "==", classHash)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            dispatch({
              type: RECEIVE_ANSWERS,
              response: snapshot.docs.map(doc => doc.data())
            });
          }
        }, (err: Error) => {
          // tslint:disable-next-line no-console
          console.error("Firestore answers fetch error", err);
          dispatch(fetchError({
            status: 500,
            statusText: `Firestore answers fetch error: ${err.message}`
          }));
        });
    }
  };
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
      dst[dstKey] = src[key];
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
        type: "updateReportSettings",
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
        type: "updateReportSettings",
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
      type: "updateReportSettings",
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
      type: "updateReportSettings",
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

export function updateFeedback(answerKey: string, feedback: any) {
  const feedbackData = mappedCopy(feedback, {hasBeenReviewed: "has_been_reviewed"});
  feedbackData.answer_key = answerKey;
  return {
    type: UPDATE_FEEDBACK,
    answerKey,
    feedback,
    callAPI: {
      type: "updateReportSettings",
      errorAction: fetchError,
      data: {
        feedback: feedbackData,
      },
    },

  };
}

export function enableFeedback(embeddableKey: string, feedbackFlags: any) {
  const mappings = {
    feedbackEnabled: "enable_text_feedback",
    rubricEnabled: "rubric_enabled",
    scoreEnabled: "enable_score",
    maxScore: "max_score",
  };
  const feedbackSettings: any = mappedCopy(feedbackFlags, mappings);
  feedbackSettings.embeddable_key = embeddableKey;

  return {
    type: ENABLE_FEEDBACK,
    embeddableKey,
    feedbackFlags,
    callAPI: {
      type: "updateReportSettings",
      errorAction: fetchError,
      data: {
        feedback_opts: feedbackSettings,
      },
    },
  };
}

export function updateActivityFeedback(activityFeedbackKey: string, feedback: any) {
  const feedbackData = mappedCopy(feedback, {
    hasBeenReviewed: "has_been_reviewed",
    activityFeedbackId: "activity_feedback_id",
    learnerId: "learner_id",
    feedback: "text_feedback",
    rubricFeedback: "rubric_feedback",
  });
  feedbackData.feedback_key = activityFeedbackKey;
  return {
    type: UPDATE_ACTIVITY_FEEDBACK,
    activityFeedbackKey,
    feedback,
    callAPI: {
      type: "updateReportSettings",
      errorAction: fetchError,
      data: {
        activity_feedback: feedbackData,
      },
    },
  };
}

export function enableActivityFeedback(activityId: string, feedbackFlags: any, invalidatePreviousFeedback = true) {
  const mappings = {
    enableTextFeedback: "enable_text_feedback",
    scoreType: "score_type",
    maxScore: "max_score",
    activityFeedbackId: "activity_feedback_id",
    useRubric: "use_rubric",
  };
  const feedbackSettings = mappedCopy(feedbackFlags, mappings);
  return {
    type: ENABLE_ACTIVITY_FEEDBACK,
    activityId,
    invalidatePreviousFeedback,
    feedbackFlags,
    callAPI: {
      type: "updateReportSettings",
      errorAction: fetchError,
      data: {
        actvity_feedback_opts: feedbackSettings,
      },
    },
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
