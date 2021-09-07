import QFillInTheBlankIcon from "../../img/svg-icons/q-fill-in-the-blank-type-icon.svg";
import QImageIcon from "../../img/svg-icons/q-image-type-icon.svg";
import QImageWithOpenResponseIcon from "../../img/svg-icons/q-image-w-open-response-type-icon.svg";
import QInteractiveCodapIcon from "../../img/svg-icons/q-interactive-codap-type-icon.svg";
import QInteractiveTableIcon from "../../img/svg-icons/q-interactive-table-type-icon.svg";
import QInteractiveIcon from "../../img/svg-icons/q-interactive-type-icon.svg";
import QMANonScoredIcon from "../../img/svg-icons/q-ma-nonscored-type-icon.svg";
import QMAScoredIcon from "../../img/svg-icons/q-ma-scored-type-icon.svg";
import QMCNonScoredIcon from "../../img/svg-icons/q-mc-nonscored-type-icon.svg";
import QMCScoredIcon from "../../img/svg-icons/q-mc-scored-type-icon.svg";
import QOpenResponseIcon from "../../img/svg-icons/q-open-response-type-icon.svg";
import { Map } from "immutable";

export interface QuestionType {
  name: string;
  type: string;
  scored: boolean | undefined;
  icon: any;
}

export const QuestionTypes: QuestionType[] = [
  {
    name: "Fill in the Blank",
    type: "",
    scored: undefined,
    icon: QFillInTheBlankIcon
  },
  {
    name: "Image Question",
    type: "",
    scored: undefined,
    icon: QImageIcon
  },
  {
    name: "Image Question with Open Response",
    type: "image_question",
    scored: undefined,
    icon: QImageWithOpenResponseIcon
  },
  {
    name: "Interactive Codap",
    type: "",
    scored: undefined,
    icon: QInteractiveCodapIcon
  },
  {
    name: "Interactive Table",
    type: "",
    scored: undefined,
    icon: QInteractiveTableIcon
  },
  {
    name: "Interactive",
    type: "iframe_interactive",
    scored: undefined,
    icon: QInteractiveIcon
  },
  {
    name: "Multiple Answer Scored",
    type: "",
    scored: true,
    icon: QMAScoredIcon
  },
  {
    name: "Multiple Answer NonScored",
    type: "",
    scored: false,
    icon: QMANonScoredIcon
  },
  {
    name: "Multiple Choice Scored",
    type: "multiple_choice",
    scored: true,
    icon: QMCScoredIcon
  },
  {
    name: "Multiple Choice NonScored",
    type: "multiple_choice",
    scored: false,
    icon: QMCNonScoredIcon
  },
  {
    name: "Open Response",
    type: "open_response",
    scored: undefined,
    icon: QOpenResponseIcon
  },

];

export const getQuestionIcon = (question?: Map<string, any>): any => {
  if (!question) {
    console.warn("No question given, using default iframe interactive icon");
    return QInteractiveIcon;
  }

  const questionType = QuestionTypes.find(qt => qt.type === question.get("type") && qt.scored === question.get("scored"));
  if (!questionType) {
    console.warn(`Cannot find icon for question type ${question.get("type")} and scored value: ${question.get("scored")}`);
    return QInteractiveIcon;
  }

  return questionType.icon;
};
