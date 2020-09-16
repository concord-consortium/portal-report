import React, { PureComponent } from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
}

export default class MultipleChoiceQuestion extends PureComponent<IProps> {
  render() {
    const { question } = this.props;
    const prompt = question?.get("prompt");
    const choices: Map<string,any> = question?.get("choices") || [];

    return (
      <div className={css.questionText}>
      {prompt && renderHTML(prompt)}
      { choices.size > 0 ? choices.toArray().map(this.renderMultipleChoiceChoices(choices.toArray().length)) : "" }
      </div>
    );
  }

  private renderMultipleChoiceChoices = (numChoices: number) => (choices: Map<string, any>, i: number) => {
    let multipleChoiceContent, multipleChoiceContentClass;
    if (choices.get("correct")) {
      multipleChoiceContentClass = `${css.mcContent} ${css.correct}`;
      multipleChoiceContent = choices.get("content") + " (correct)";
    }
    else {
      multipleChoiceContentClass = `${css.mcContent}`;
      multipleChoiceContent = choices.get("content");
    }
    return (
      <div className={css.choiceWrapper} key={`choices ${i}`}>
        <div className={`${css.choiceIcon}`} />
        <div className={`${multipleChoiceContentClass}`}>
          {multipleChoiceContent}
        </div>
      </div>
    );
  }
}
