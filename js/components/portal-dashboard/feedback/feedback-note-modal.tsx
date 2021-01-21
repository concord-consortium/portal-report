import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import { FeedbackLevel } from "../../../util/misc";

import css from "../../../../css/portal-dashboard/feedback/feedback-note-modal.less";

interface IProps {
  backdrop: boolean | "static";
  feedbackLevel: FeedbackLevel;
  onHide: (value: boolean) => void;
  show: boolean;
}

export class FeedbackNoteModal extends PureComponent<IProps> {

  render() {
    const { backdrop, feedbackLevel, onHide, show } = this.props;
    let feedbackNoteTitle = "Activity-level Feedback";
    let feedbackNoteText = "You may provide a student with written feedback at the activity level once the student has completed the activity.";
    if (feedbackLevel === "Question") {
      feedbackNoteTitle = "Question-level Feedback";
      feedbackNoteText = "You may provide a student with written feedback at the question level once an answer has been submitted.";
    }

    return (
      <Modal animation={false} backdrop={backdrop} centered dialogClassName={css.lightbox} onHide={onHide} show={show} data-cy="feedback-note-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="feedback-note-modal-header">
          <div className={css.title} data-cy="feedback-note-modal-header-text">
            {feedbackNoteTitle}
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="feedback-note-modal-content-area">
            <p>{feedbackNoteText}</p>
            <p>You may also choose <strong>not to provide</strong> written feedback simply by not entering text in the feedback entry field.</p>
          </div>
          <div className={css.closeButton} onClick={this.handleCloseLightbox} data-cy="feedback-note-modal-close-button">
            Got it
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  private handleCloseLightbox = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }

}
