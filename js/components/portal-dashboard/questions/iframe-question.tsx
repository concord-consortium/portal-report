import React from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
}

export const IframeQuestion: React.FC<IProps> = (props) => {
  const { question } = props;
  const prompt = question?.get("prompt");
  const blankRegEx = /\[([^)]+)\]/g;
  const promptText = prompt?.replace(blankRegEx,'__________');

    return (
    <div className={css.questionText}>
      {prompt && renderHTML(promptText)}
    </div>
  );
};
