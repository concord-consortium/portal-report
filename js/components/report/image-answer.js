import React, { PureComponent } from "react";
import ImageAnswerModal from "./image-answer-modal";

import "../../../css/report/image-answer.less";
import { renderInvalidAnswer } from "../../util/answer-utils";

export default class ImageAnswer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  render() {
    const { answer } = this.props;
    const imgAnswer = answer?.answer;
    if (!imgAnswer) {
      // There are broken answer documents that do not include an answer field
      // Don't crash, just provide a error message to the teacher
      return renderInvalidAnswer(answer, "response is missing answer field");
    }
    return (
      <div>
        <div className="image-answer">
          <img src={imgAnswer?.imageUrl} onClick={() => this.setState({modalOpen: true})} data-cy="answer-image"/>
          <div className="image-answer-note">{imgAnswer?.note}</div>
        </div>
        <ImageAnswerModal answer={answer} show={this.state.modalOpen} onHide={() => this.setState({modalOpen: false})} />
      </div>
    );
  }
}
