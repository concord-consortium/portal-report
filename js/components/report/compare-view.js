import React, { PureComponent } from "react";
import Answer from "./answer";
import { CompareAnswerRmLinkContainer } from "../../containers/report/compare-answer";

import "../../../css/report/compare-view.less";

export default class CompareView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: Set(),
    };
  }

  answerClassName(answer) {
    const { highlighted } = this.state;
    const id = answer?.id;
    return `answer-wrapper ${highlighted.has(id) ? "highlighted" : ""}`;
  }

  toggleHighlight(answer) {
    const { highlighted } = this.state;
    const id = answer?.id;
    const isHighlighted = highlighted.has(id);
    const newHighlightedSet = isHighlighted ? highlighted.delete(id) : highlighted.add(id);
    this.setState({highlighted: newHighlightedSet});
  }

  render() {
    const { answers, question } = this.props;
    return (
      <div className="compare-view" data-test="compare-view">
        <div className="answers-container">
          {answers.map(a =>
            <div className={this.answerClassName(a)} key={a?.id}>
              <div>
                <strong>{a.getIn(["student", "name"])}</strong>
                <div className="controls">
                  <CompareAnswerRmLinkContainer answer={a}>Remove</CompareAnswerRmLinkContainer>
                  {" | "}
                  <a onClick={() => this.toggleHighlight(a)}>Highlight</a>
                </div>
              </div>
              <div className="answer">
                <Answer question={question} answer={a} alwaysOpen />
              </div>
            </div>,
          )}
        </div>
      </div>
    );
  }
}
