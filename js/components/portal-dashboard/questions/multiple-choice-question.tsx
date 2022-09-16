import React from "react";
import { List } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
  useMinHeight?: boolean;
}

export const MultipleChoiceQuestion: React.FC<IProps> = (props) => {
  const { question } = props;
  const prompt = question?.get("prompt");
  const choices: List<any> = question?.get("choices") || List([]);

  return (
    <div className={css.questionText}>
      { prompt && renderHTML(prompt) }
      { choices.toArray().map((choice: Map<string, any>, i: number) => {
        const multipleChoiceContent = `${choice.get("content")} ${choice.get("correct") ? "(correct)" : ""}`;
        const multipleChoiceContentClass = choice.get("correct") ? css.correct : "";
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
