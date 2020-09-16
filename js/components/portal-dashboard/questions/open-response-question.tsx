import React, { PureComponent } from "react";
import { Map } from "immutable";
import { renderHTML } from "../../../util/render-html";

import css from "../../../../css/portal-dashboard/questions/multiple-choice-question.less";

interface IProps {
  question?: Map<string, any>;
}

export default class OpenResponseQuestion extends PureComponent<IProps> {
  render() {
    const { question } = this.props;
    const prompt = question?.get("prompt");

    return (
      <div className={css.questionText}>
        {prompt && renderHTML(prompt)}
      </div>
    );
  }
}
