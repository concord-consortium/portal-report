import React from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
}

export const MultipleChoiceQuestion: React.FC<IProps> = (props) => {
  const { question } = props;
  const prompt = question?.get("prompt");
  const choices: Map<string, any> = question?.get("choices") || [];

  return (
    <div className={css.questionText}>
      { prompt && renderHTML(prompt) }
      { choices.toArray?.().map( (choices: Map<string, any>, i: number) => {
        const multipleChoiceContent = `${choices.get("content")} ${choices.get("correct") ? "(correct)" : ""}`;
        const multipleChoiceContentClass = choices.get("correct") ? css.correct : "";
        return (
          <div className={css.choiceWrapper} key={`choices ${i}`}>
            <div className={css.choiceIcon} />
            <div className={multipleChoiceContentClass}>
              {multipleChoiceContent}
            </div>
          </div>
        );
      })}
    </div>
  );
};
