import React from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";
import ReportItemIframe from "../report-item-iframe";

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
      {question && question.get("reportItemUrl") && <ReportItemIframe question={question} view={useMinHeight ? "singleAnswer" : "multipleAnswer"} />}
    </div>
  );
};
