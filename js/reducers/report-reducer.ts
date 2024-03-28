import Immutable, { Map, List, Set } from "immutable";
import queryString from "query-string";
import { RecordFactory } from "../util/record-factory";

import {
  normalizeResourceJSON,
  preprocessPortalDataJSON,
  preprocessAnswersJSON,
  IPortalData
} from "../core/transform-json-response";
import {
  SET_ANONYMOUS_VIEW,
  RECEIVE_RESOURCE_STRUCTURE,
  RECEIVE_USER_SETTINGS,
  SET_NOW_SHOWING,
  HIDE_UNSELECTED_QUESTIONS,
  SHOW_UNSELECTED_QUESTIONS,
  RECEIVE_PORTAL_DATA,
  SET_ANSWER_SELECTED_FOR_COMPARE,
  SHOW_COMPARE_VIEW,
  HIDE_COMPARE_VIEW,
  RECEIVE_ANSWERS,
  REGISTER_REPORT_ITEM,
  UNREGISTER_REPORT_ITEM,
  SET_REPORT_ITEM_ANSWER,
  GET_REPORT_ITEM_ANSWER
} from "../actions";
import { IGetReportItemAnswer, IReportItemAnswer, IReportItemHandlerMetadata } from "@concord-consortium/interactive-api-host";

export type ReportType = "class" | "student";

export interface IReportState {
  // Type: 'class' or 'student'. Used by regular report only. 'class' displays all the answers,
  // while 'student' focuses on one student only.
  type: ReportType;
  nowShowing: ReportType;
  clazzName: string;
  clazzId: number;
  students: Map<any, any>;
  teachers: Map<any, any>;
  answers: Map<any, any>;
  sequences: Map<any, any>;
  activities: Map<any, any>;
  sections: Map<any, any>;
  pages: Map<any, any>;
  questions: Map<any, any>;
  selectedStudentIds: List<string>;
  hideControls: boolean;
  hideSectionNames: boolean;
  userId: string;
  platformUserId: string;
  platformUserName: string;
  loggingUserName: string;
  userType: IPortalData["userType"];
  contextId: string;
  resourceLinkId: string;
  platformId: string;
  sourceKey: string;
  anonymous: boolean;
  compareViewAnswers: Set<string> | null;
  // Note that this filter will be respected only in Dashboard report. Check report-tree.js and isQuestionVisible helper.
  showFeaturedQuestionsOnly: boolean;
  hasTeacherEdition: boolean;
  reportItemAnswersFull: Map<string, IReportItemAnswer>;
  reportItemAnswersCompact: Map<string, IReportItemAnswer>;
  reportItemMetadata: Map<string, IReportItemHandlerMetadata>;
}

const INITIAL_REPORT_STATE = RecordFactory<IReportState>({
  type: "class",
  nowShowing: "class",
  clazzName: "",
  clazzId: -1,
  students: Map({}),
  teachers: Map({}),
  answers: Map({}),
  sequences: Map({}),
  activities: Map({}),
  sections: Map({}),
  pages: Map({}),
  questions: Map({}),
  selectedStudentIds: List([]),
  hideControls: false,
  hideSectionNames: false,
  userId: "",
  platformUserId: "",
  platformUserName:"",
  loggingUserName:"",
  userType: "" as any,
  contextId: "",
  resourceLinkId: "",
  platformId: "",
  sourceKey: "",
  anonymous: false,
  compareViewAnswers: null,
  showFeaturedQuestionsOnly: true,
  hasTeacherEdition: false,
  reportItemAnswersFull: Map(),
  reportItemAnswersCompact: Map(),
  reportItemMetadata: Map(),
});

const reportItemIFramePhones: Record<string, any> = {};

export class ReportState extends INITIAL_REPORT_STATE implements IReportState {
  constructor(config: Partial<IReportState>) {
    super(config);
  }
  type: ReportType;
  nowShowing: ReportType;
  clazzName: string;
  clazzId: number;
  students: Map<any, any>;
  teachers: Map<any, any>;
  answers: Map<any, any>;
  sequences: Map<any, any>;
  activities: Map<any, any>;
  sections: Map<any, any>;
  pages: Map<any, any>;
  questions: Map<any, any>;
  selectedStudentIds: List<string>;
  hideControls: boolean;
  hideSectionNames: boolean;
  userId: string;
  platformUserId: string;
  platformUserName: string;
  loggingUserName: string;
  userType: IPortalData["userType"];
  contextId: string;
  resourceLinkId: string;
  platformId: string;
  sourceKey: string;
  anonymous: boolean;
  compareViewAnswers: Set<string> | null;
  showFeaturedQuestionsOnly: boolean;
  hasTeacherEdition: boolean;
  reportItemAnswersFull: Map<string, IReportItemAnswer>;
  reportItemAnswersCompact: Map<string, IReportItemAnswer>;
  reportItemMetadata: Map<string, IReportItemHandlerMetadata>;
}

// this exists to handle older interactives until they are updated to use the new report item api
interface IInterimGetReportItemAnswer extends IGetReportItemAnswer {
  type: "html";
}

export default function report(state = new ReportState({}), action?: any) {
  let data;
  // Report type depends on what kind of user is launching the report and whether `studentId` URL param is provided.
  // Students can only see their own report. Teachers can see either class report or individual student report.
  // Theoretically student can easily modify URL parameter to open report of the other student. But this report
  // will be always empty, as student-oriented report queries only student own answers (student user id is coming
  // from JWT info) and Firestore security rules also ensure that.
  const studentId = queryString.parse(window.location.search).studentId as string | undefined;
  const urlBasedStudentSelection: List<string> = studentId ? List([ studentId ]) : List();
  switch (action.type) {
    case SET_ANONYMOUS_VIEW:
      state = state
      .set("type", "student")
      .set("nowShowing", "student")
      .set("selectedStudentIds", List([action.runKey]))
      .set("hideControls", true)
      .set("students", Map({ [action.runKey]: Map({ name: "Anonymous", id: action.runKey }) }))
      .set("platformUserId", action.runKey);
      return state;
    case RECEIVE_PORTAL_DATA:
      data = preprocessPortalDataJSON(action.response);

      let type: ReportType = "student";
      let hideControls = true;
      if (!studentId && (data.userType === "teacher" || data.userType === "researcher")) {
        // Ensure that Portal data also indicates that the user is a teacher or researcher. Otherwise, student could just
        // remove "studentId" URL parameter to see the full class report.
        type = "class";
        hideControls = false;
      }
      state = state
        .set("type", type)
        .set("nowShowing", type)
        .set("selectedStudentIds", urlBasedStudentSelection)
        .set("hideControls", hideControls)
        .set("clazzName", data.classInfo.name)
        .set("clazzId", data.classInfo.id)
        .set("students", Map(data.classInfo.students.map(student => [student.id, Map(student)])))
        .set("teachers", Map(data.classInfo.teachers.map(teacher => [teacher.id, Map(teacher)])))
        .set("platformUserId", data.platformUserId)
        .set("platformUserName",data.offering.teacher)
        .set("loggingUserName", getLoggingUserName(data))
        .set("userType", data.userType)
        .set("contextId", data.contextId)
        .set("resourceLinkId", data.offering.id.toString())
        .set("platformId", data.platformId)
        .set("sourceKey", data.sourceKey)
        .set("hasTeacherEdition", data.offering.hasTeacherEdition);
      return state;
    case RECEIVE_RESOURCE_STRUCTURE:
      data = normalizeResourceJSON(action.response);
      state = state
        .set("sequences", Immutable.fromJS(data.entities.sequences) as Map<any, any>)
        .set("activities", Immutable.fromJS(data.entities.activities) as Map<any, any>)
        .set("sections", Immutable.fromJS(data.entities.sections) as Map<any, any>)
        .set("pages", Immutable.fromJS(data.entities.pages) as Map<any, any>)
        .set("questions", Immutable.fromJS(data.entities.questions) as Map<any, any>);
      return state;
    case RECEIVE_ANSWERS:
      return state.set("answers", Immutable.fromJS(preprocessAnswersJSON(action.response)) as Map<any, any>);
    case SET_NOW_SHOWING:
      return state
        .set("nowShowing", action.nowShowingValue)
        .set("selectedStudentIds", action.selectedStudentIds ? action.selectedStudentIds : urlBasedStudentSelection);

    // The following actions trigger API middleware that invokes the FireStore API.
    // The results of middleware invocation are handled by the `RECEIVE_USER_SETTINGS` action.
    // These FireStore API calls return immediately.
    // See: https://firebase.google.com/docs/firestore/query-data/listen

    // Two NO-OP Named actions only call the FireStore middleware:
    // case SET_ANONYMOUS: ; // No direct reducer action, only API middleware.
    // case SET_QUESTION_SELECTED: ; // No direct reducer action, only API middleware.
    case HIDE_UNSELECTED_QUESTIONS:
      return hideUnselectedQuestions(state);
    case SHOW_UNSELECTED_QUESTIONS:
      return showUnselectedQuestions(state);

    // The middleware triggered API from above will result in invokation of:
    case RECEIVE_USER_SETTINGS:
      if (action.response) {
        return setUserSettings(state, action.response);
      }
      return state;

    case SET_ANSWER_SELECTED_FOR_COMPARE:
      const compareViewAns = state.get("compareViewAnswers");
      if (compareViewAns) {
        // If compare view is open and user unselect given answer, remove it from the compare set too.
        // It's possible, as there is "Remove" link in the compare view.
        state = state.set("compareViewAnswers", compareViewAns.delete(action.id));
      }
      return state.setIn(["answers", action.id, "selectedForCompare"], action.value);
    case SHOW_COMPARE_VIEW:
      const selectedAnswerIds = state.get("answers")
        .filter(a => a.get("selectedForCompare") && a.get("questionId") === action.questionId)
        .map(a => a.get("id"))
        .values();
      return state.set("compareViewAnswers", Set(selectedAnswerIds));
    case HIDE_COMPARE_VIEW:
      return state.set("compareViewAnswers", null);

    case REGISTER_REPORT_ITEM:
      reportItemIFramePhones[action.questionId] = action.iframePhone;
      return processReportItemRequests(state.setIn(["reportItemMetadata", action.questionId], action.reportItemMetadata || {}));
    case UNREGISTER_REPORT_ITEM:
      delete reportItemIFramePhones[action.questionId];
      return state;
    case GET_REPORT_ITEM_ANSWER:
      reportItemAnswerRequests.push({
        questionId: action.questionId,
        platformUserId: action.platformUserId,
        itemsType: action.itemsType
      });
      return processReportItemRequests(state);
    case SET_REPORT_ITEM_ANSWER:
      const answer = getAnswer(state, action.questionId, action.reportItemAnswer.platformUserId);
      let storageName: keyof IReportState;
      if (action.reportItemAnswer.itemsType === "compactAnswer") {
        storageName = "reportItemAnswersCompact";
      } else if (action.reportItemAnswer.itemsType === "fullAnswer") {
        storageName = "reportItemAnswersFull";
      } else {
        // Old interactives might not send back itemsType. Storage name should default to "reportItemAnswersFull".
        storageName = "reportItemAnswersFull";
      }
      const currentReportItemAnswer = (answer && state.getIn([storageName, answer.get("id")])) || null;
      const reportItemAnswerChanged = JSON.stringify(currentReportItemAnswer) !== JSON.stringify(action.reportItemAnswer);
      if (answer && reportItemAnswerChanged) {
        return state.setIn([storageName, answer.get("id")], action.reportItemAnswer);
      } else {
        return state;
      }

    default:
      return state;
  }
}

let reportItemAnswerRequests: Array<{questionId: string; platformUserId: string; itemsType?: "fullAnswer" | "compactAnswer"}> = [];

function getAnswer(state: ReportState, questionId: string, platformUserId: string) {
  return state.answers.find(a => {
    return a.get("questionId") === questionId && a.get("platformUserId") === platformUserId;
  });
}

function processReportItemRequests(state: ReportState) {
  // use filter to remove requests that have iframe phones registered, regardless of the existence of an answer
  reportItemAnswerRequests = reportItemAnswerRequests.filter(({questionId, platformUserId, itemsType}) => {
    const iframePhone = reportItemIFramePhones[questionId];
    const reportItemMetadata = state.get("reportItemMetadata").get(questionId);
    if (iframePhone) {
      // Interactive has to send report item metadata with `compactAnswerReportItemsAvailable=true` so the requests for
      // compact answer are issued. Otherwise, they're ignored for performance reasons (old interactives might not
      // handle report item type and render all the report items in response to this request).
      if (itemsType === "compactAnswer" && !reportItemMetadata?.compactAnswerReportItemsAvailable) {
        return false; // request processed, can be removed from array
      }
      const answer = getAnswer(state, questionId, platformUserId);
      if (answer) {
        let interactiveState: any = null;
        let authoredState: any = null;
        let reportState: any = answer.get("reportState");
        try {
          reportState = JSON.parse(reportState);
          interactiveState = reportState.interactiveState;
          authoredState = reportState.authoredState;
        } catch {
          console.error("Unable to JSON parse reportState, sending null for interactiveState and authoredState.  Unparseable reportState:", reportState);
        }
        try {
          interactiveState = JSON.parse(interactiveState);
        } catch {
          console.error("Unable to JSON parse interactiveState in answer, sending interactiveState as null.  Unparseable interactiveState:", interactiveState);
        }
        try {
          authoredState = JSON.parse(authoredState);
        } catch {
          console.error("Unable to JSON parse authoredState in answer, sending authoredState as null.  Unparseable authoredState:", authoredState);
        }
        const request: Omit<IInterimGetReportItemAnswer, "requestId"> = {
          version: "2.1.0",
          type: "html",
          platformUserId,
          interactiveState,
          authoredState,
          itemsType: itemsType || "fullAnswer"
        };
        iframePhone.post("getReportItemAnswer", request);
      }
      return false; // request processed, can be removed from array
    }
    return true; // iframe not available, request not processed, needs to stay in the array
  });
  return state;
}

// This action has to be explicit, otherwise, a question will disappear
// immediately when teacher has selection filter active and unselects given
// question. Instead, the question should stay visible until teacher clicks
// "Show selected" again.
function hideUnselectedQuestions(state: ReportState) {
  return state.withMutations(state => {
    const someSelected = state.get("questions").size > 0;
    state.get("questions").forEach((value: any, key: any) => {
      const selected = state.getIn(["questions", key, "selected"]);
      if (someSelected) {
        state = state.setIn(["questions", key, "hiddenByUser"], !selected);
      } else {
        state = state.setIn(["questions", key, "hiddenByUser"], false);
      }
    });
    return state;
  });
}

function showUnselectedQuestions(state: ReportState) {
  return state.withMutations(state => {
    state.get("questions").forEach((value, key) => {
      state = state.setIn(["questions", key, "hiddenByUser"], false);
    });
    return state;
  });
}

function setUserSettings(state: ReportState, response: any) {
  const {visibility_filter, anonymous_report} = response;
  let selectedQuestions: any[] = [];
  // The visibility_filter might not be setup on the user settings yet
  if (visibility_filter?.questions) {
    selectedQuestions = visibility_filter.questions;
  }
  return state.withMutations((state: ReportState) => {
    state.get("questions").forEach((value, key) => {
      const selected = selectedQuestions.indexOf(key) > -1;
      state = state.setIn(["questions", key, "selected"], selected);
    });
    state = setAnonymous(state, anonymous_report);
    return state;
  });
}

function setAnonymous(state: ReportState, anonymous: boolean) {
  let idx = 1;
  const newStudents = state.get("students")
    .map(s => s.set("name", anonymous ? `Student ${idx++}` : s.get("realName"))) as Map<any, any>;
  return state.set("anonymous", anonymous).set("students", newStudents);
}

export function getLoggingUserName(data: IPortalData) {
  const matches = data.platformId.match(/:\/\/([^/]*)/); // extracts example.com from <protocol>://example.com</optional-path>
  const platformDomain = matches?.[1] || "unknown";
  const platformUserId = data.platformUserId || "unknown";
  return `${platformUserId}@${platformDomain}`;
}
