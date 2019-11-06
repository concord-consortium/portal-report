import React, { PureComponent } from "react";
import ImageAnswerModal from "./image-answer-modal";

import "../../../css/report/image-answer.less";

export default class ImageAnswer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  render() {
    const { answer } = this.props;
    const imgAnswer = answer.get("answer");
    return (
      <div>
        <div className="image-answer">
          <img src={imgAnswer.get("imageUrl")} onClick={() => this.setState({modalOpen: true})} data-cy="answer-image"/>
          <div className="image-answer-note">{imgAnswer.get("note")}</div>
        </div>
        <ImageAnswerModal answer={answer} show={this.state.modalOpen} onHide={() => this.setState({modalOpen: false})} />
      </div>
    );
  }
}
