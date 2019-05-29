import db from "../db";
import { getHostname } from "../util/misc";
import fakeSequenceStructure from "../data/sequence-structure.json";

export const INVALIDATE_DATA = "INVALIDATE_DATA";
export const REQUEST_OFFERING_DATA = "REQUEST_OFFERING_DATA";
export const RECEIVE_RESOURCE_STRUCTURE = "RECEIVE_RESOURCE_STRUCTURE";
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

// When fetch succeeds, receiveOfferingData action will be called with the response object (json in this case).
// REQUEST_OFFERING_DATA action will be processed by the reducer immediately.
// See: api-middleware.js
export function fetchAndObserveData() {
  return {
    type: REQUEST_OFFERING_DATA,
    // Start with fetching offering data. It will cause other actions to be chained later.
    callAPI: {
      type: "fetchOfferingData",
      successAction: receiveOfferingData,
      errorAction: fetchError,
    },
  };
}

function receiveOfferingData(response) {
  return (dispatch) => {
    const url = response.activity_url;
    const source = getHostname(url).replace(/\./g, "_");
    if (source === "fake_authoring_system") { // defined in data/offering-data.json
      // Use fake data.
      dispatch({
        type: RECEIVE_RESOURCE_STRUCTURE,
        response: fakeSequenceStructure,
        receivedAt: Date.now(),
      });
    } else {
      // Setup Firebase observer. It will fire each time the resource structure is updated.
      db.collection(`sources/${source}/resources`)
        .where("url", "==", url)
        .onSnapshot(doc => {
          if (!doc.empty) {
            dispatch({
              type: RECEIVE_RESOURCE_STRUCTURE,
              response: doc.docs[0].data(),
              receivedAt: Date.now(),
            });
          }
        });
    }
  };
}

function fetchError(response) {
  return {
    type: FETCH_ERROR,
    response: response,
    receivedAt: Date.now(),
  };
}

function mappedCopy(src, fieldMappings) {
  const dst = {};
  let dstKey;
  for (let key in src) {
    if (src.hasOwnProperty(key)) {
      dstKey = fieldMappings[key] || key;
      dst[dstKey] = src[key];
    }
  }
  return dst;
}

export function invalidateData() {
  return {type: INVALIDATE_DATA};
}

export function setQuestionSelected(key, value) {
  return (dispatch, getState) => {
    const questionsMap = getState().getIn(["report", "questions"]);
    // the questionsMap represents the previous state of the checkboxes
    // so the filter needs to special case the current key
    const selectedQuestionKeys = Array.from(questionsMap.values())
      .filter(q => q.get("key") === key ? value : q.get("selected"))
      .map(q => q.get("key"));
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
  return (dispatch, getState) => {
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

export function setNowShowing(value) {
  return {
    type: SET_NOW_SHOWING,
    value,
  };
}

export function setAnonymous(value) {
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

export function setAnswerSelectedForCompare(key, value) {
  return {type: SET_ANSWER_SELECTED_FOR_COMPARE, key, value};
}

export function showCompareView(embeddableKey) {
  return {type: SHOW_COMPARE_VIEW, embeddableKey};
}

export function hideCompareView() {
  return {type: HIDE_COMPARE_VIEW};
}

export function showFeedbackView(embeddableKey) {
  return {type: SHOW_FEEDBACK, embeddableKey};
}

export function updateFeedback(answerKey, feedback) {
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

export function enableFeedback(embeddableKey, feedbackFlags) {
  const mappings = {
    feedbackEnabled: "enable_text_feedback",
    rubricEnabled: "rubric_enabled",
    scoreEnabled: "enable_score",
    maxScore: "max_score",
  };
  const feedbackSettings = mappedCopy(feedbackFlags, mappings);
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

export function updateActivityFeedback(activityFeedbackKey, feedback) {
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

export function enableActivityFeedback(activityId, feedbackFlags, invalidatePreviousFeedback = true) {
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

export function trackEvent(category, action, label) {
  return (dispatch, getState) => {
    dispatch({
      type: TRACK_EVENT,
      category,
      action,
      label,
    });
    const clazzId = getState().getIn(["report", "clazzId"]);
    let labelText = "Class ID: " + clazzId + " - " + label;
    labelText = labelText.replace(/ - $/, "");
    gtag("event", action, {"event_category": category, "event_label": labelText});
  };
}
