import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import { renderInvalidAnswer } from "../../util/answer-utils";

export default class ImageAnswerModal extends PureComponent {
  componentDidMount() {
    window.addEventListener("click", this.windowClicked.bind(this), true);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.windowClicked.bind(this));
  }

  windowClicked() {
    const { show, onHide } = this.props;
    if (show) {
      // hide the modal with any click in the window and not just the modal background
      onHide();
    }
  }

  render() {
    const { answer, show, onHide } = this.props;
    if(!answer) {
      return null;
    } else {
      if (!(answer?.answer?.imageUrl)) { return renderInvalidAnswer(answer, "response is missing answer field"); }
    }
    return (
      <Modal show={show} onHide={onHide} animation={false}>
        <Modal.Header closeButton closeLabel="" />
        <Modal.Body>
          <img src={answer?.answer?.imageUrl} style={{display: "block", margin: "0 auto"}} data-cy="image-answer-modal"/>
        </Modal.Body>
        <Modal.Footer>
          <div style={{fontWeight: "bold"}}>{answer?.student?.name}</div>
          <div>{answer?.answer?.text}</div>
        </Modal.Footer>
      </Modal>
    );
  }
}
