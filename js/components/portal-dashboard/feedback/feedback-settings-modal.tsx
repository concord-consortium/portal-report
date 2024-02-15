import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-modal.less";

interface IProps {
  backdrop: boolean | "static";
  onHide: (value: boolean) => void;
  show: boolean;
}

export class FeedbackSettingsModal extends PureComponent<IProps> {

  render() {
    const { backdrop, onHide, show } = this.props;

    return (
      <Modal animation={false} backdrop={backdrop} centered dialogClassName={css.lightbox} onHide={onHide} show={show} data-cy="feedback-settings-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="feedback-settings-modal-header">
          <div className={css.title} data-cy="feedback-settings-modal-header-text">
            Activity Score Settings
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="feedback-settings-modal-content-area">
            <p>TBD</p>
          </div>
          <div className={css.closeButton} onClick={this.handleCloseLightbox} data-cy="feedback-settings-modal-close-button">
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
