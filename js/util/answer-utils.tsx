import { Map } from "immutable";
import QFillInTheBlankCompletedIcon from "../../img/svg-icons/q-fill-in-the-blank-completed-icon.svg";
import QImageCompletedIcon from "../../img/svg-icons/q-image-completed-icon.svg";
import QImageWithOpenResponseCompletedIcon from "../../img/svg-icons/q-image-w-open-response-completed-icon.svg";
import QInteractiveCodapCompletedIcon from "../../img/svg-icons/q-interactive-codap-completed-icon.svg";
import QInteractiveCompletedIcon from "../../img/svg-icons/q-interactive-completed-icon.svg";
import QInteractiveTableCompletedIcon from "../../img/svg-icons/q-interactive-table-completed-icon.svg";
import QMANonScoredCompletedIcon from "../../img/svg-icons/q-ma-nonscored-completed-icon.svg";
import QMAScoredCorrectIcon from "../../img/svg-icons/q-ma-scored-correct-icon.svg";
import QMAScoredIncorrectIcon from "../../img/svg-icons/q-ma-scored-incorrect-icon.svg";
import QMCNonScoredCompletedIcon from "../../img/svg-icons/q-mc-nonscored-completed-icon.svg";
import QMCScoredCorrectIcon from "../../img/svg-icons/q-mc-scored-correct-icon.svg";
import QMCScoredIncorrectIcon from "../../img/svg-icons/q-mc-scored-incorrect-icon.svg";
import QOpenResponseCompletedIcon from "../../img/svg-icons/q-open-response-completed-icon.svg";
import { TrackEventFunction } from "../actions";
import React from "react";

export interface AnswerType {
  name: string;
  type: string;
  correct: boolean | undefined;
  icon: any;
}

export interface AnswerProps {
  answer: Map<string, any>;
  question: Map<string, any>;
  student: Map<any, any>;
  responsive?: boolean;
  studentName?: string;
  onAnswerSelect?: () => void;
  selected?: boolean;
  trackEvent: TrackEventFunction;
  answerOrientation: "tall" | "wide";
}

export const AnswerTypes: AnswerType[] = [
  {
    name: "Fill in the Blank Completed",
    type: "",
    correct: undefined,
    icon: QFillInTheBlankCompletedIcon
  },
  {
    name: "Image Question Completed",
    type: "",
    correct: undefined,
    icon: QImageCompletedIcon
  },
  {
    name: "Image Question with Open Response Completed",
    type: "image_question",
    correct: undefined,
    icon: QImageWithOpenResponseCompletedIcon
  },
  {
    name: "Interactive Codap Completed",
    type: "",
    correct: undefined,
    icon: QInteractiveCodapCompletedIcon
  },
  {
    name: "Interactive Table Completed",
    type: "",
    correct: undefined,
    icon: QInteractiveTableCompletedIcon
  },
  {
    name: "Interactive Completed",
    type: "iframe_interactive",
    correct: undefined,
    icon: QInteractiveCompletedIcon
  },
  {
    name: "Multiple Answer Scored Correct",
    type: "",
    correct: true,
    icon: QMAScoredCorrectIcon
  },
  {
    name: "Multiple Answer Scored Incorrect",
    type: "",
    correct: false,
    icon: QMAScoredIncorrectIcon
  },
  {
    name: "Multiple Answer NonScored Completed",
    type: "",
    correct: undefined,
    icon: QMANonScoredCompletedIcon
  },
  {
    name: "Multiple Choice Scored Correct",
    type: "multiple_choice",
    correct: true,
    icon: QMCScoredCorrectIcon
  },
  {
    name: "Multiple Choice Scored Incorrect",
    type: "multiple_choice",
    correct: false,
    icon: QMCScoredIncorrectIcon
  },
  {
    name: "Multiple Choice NonScored Completed",
    type: "multiple_choice",
    correct: undefined,
    icon: QMCNonScoredCompletedIcon
  },
  {
    name: "Open Response Completed",
    type: "open_response",
    correct: undefined,
    icon: QOpenResponseCompletedIcon
  },

];

export const getAnswerType = (answer: any, question: any) => {
  const type = answer && answer.get("questionType");
  const scored = question && question.get("scored");
  const correct = scored ? answer && answer.get("correct") : undefined;
  const answerType = AnswerTypes.find(at => at.type === type && at.correct === correct);
  return answerType;
};

export const getAnswerIconId = (answerType: any) => {
  const searchRegExp = / /g;
  const iconId = answerType ? answerType.name.toLowerCase().replace(searchRegExp, "-") : "";
  return iconId;
};

export const renderInvalidAnswer = (answer: any, errorMessage = "unknown") => {
  return (
    <div>
      <b>Error: {errorMessage}</b>
      <div>
        Details:<br/>
        id: {answer.get("id")}<br/>
        questionId: {answer.get("questionId")}
      </div>
    </div>
  );
};

export const hasResponse = (answer: any, question: any) => {
  const isNotRequired = !question.get("required");
  const isSubmitted = answer.get("submitted");
  const hasAttachment = answer.get("attachments") && answer.get("attachments").size > 0;
  // It is better if interactives don't save an empty interactive state when there is no response,
  // but there are cases where they may. So we need to check for that.
  let answerReportState;
  try {
    answerReportState = answer.get("reportState") ? JSON.parse(answer.get("reportState")) : undefined;
  } catch (e) {
    answerReportState = undefined;
  }
  const interactiveState = answerReportState ? JSON.parse(answerReportState.interactiveState) : {};
  const isNotInteractiveStateAnswer = answer.get("type") !== "interactive_state";
  const hasInteractiveStateKeys = Object.keys(interactiveState).length !== 0;
  const isNotEmptyResponse = hasAttachment || isNotInteractiveStateAnswer || hasInteractiveStateKeys;

  return (isNotRequired || isSubmitted) && isNotEmptyResponse;
};
