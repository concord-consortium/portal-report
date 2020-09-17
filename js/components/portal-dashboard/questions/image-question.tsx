import React from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/image-question.less";

interface IProps {
  question?: Map<string, any>;
}

export const ImageQuestion: React.FC<IProps> = (props) => {
  const { question } = props;
  const prompt = question?.get("prompt");
  const drawingPrompt = question?.get("drawingPrompt");
  const showDivider = drawingPrompt && prompt;
  return (
    <React.Fragment>
      <div className={`${css.questionText} ${showDivider? css.showDivider : ""}`}>
        {drawingPrompt && renderHTML(drawingPrompt)}
      </div>
      <div className={css.imageQuestionPrompt}>
        {prompt && renderHTML(prompt)}
      </div>
    </React.Fragment>
  );
};
