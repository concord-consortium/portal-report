import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";

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
    if (!answer) { return null; }
    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton closeLabel="" />
        <Modal.Body>
          <img src={answer.getIn(['answer', 'imageUrl'])} style={{display: 'block', margin: '0 auto'}} data-cy="image-answer-modal"/>
        </Modal.Body>
        <Modal.Footer>
          <div style={{fontWeight: "bold"}}>{answer.getIn(["student", "name"])}</div>
          <div>{answer.getIn(["answer", "text"])}</div>
        </Modal.Footer>
      </Modal>
    );
  }
}
