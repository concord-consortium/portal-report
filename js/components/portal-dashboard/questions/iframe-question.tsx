import React from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";
import ReportItemIframe from "../report-item-iframe";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
  useMinHeight?: boolean;
}

export const IframeQuestion: React.FC<IProps> = (props) => {
  const { question, useMinHeight } = props;
  const prompt = question?.get("prompt");
  const blankRegEx = /\[([^)]+)\]/g;
  const promptText = prompt?.replace(blankRegEx,'__________');

  return (
    <div className={css.questionText}>
      {prompt && renderHTML(promptText)}
      {question && question.get("reportItemUrl") && <ReportItemIframe key={question.get("id")} question={question} view={useMinHeight ? "singleAnswer" : "multipleAnswer"} />}
    </div>
  );
};
