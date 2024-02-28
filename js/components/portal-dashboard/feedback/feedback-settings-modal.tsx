import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";
import { FeedbackSettingsModalButton } from "./feedback-settings-modal-button";
import { FEEDBACK_MANUAL_SCORE, FEEDBACK_NO_SCORE, FEEDBACK_RUBRIC_SCORE } from "../../../api";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-modal.less";

interface IProps {
  backdrop: boolean | "static";
  onHide: (value: boolean) => void;
  show: boolean;
}

interface IState {
  scoreType: number;
}

export class FeedbackSettingsModal extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      scoreType: FEEDBACK_NO_SCORE
    };
    this.handleScoreTypeChange = this.handleScoreTypeChange.bind(this);
  }

  handleScoreTypeChange(scoreType: number) {
    this.setState({ scoreType });
  }

  render() {
    const { scoreType } = this.state;
    const { backdrop, onHide, show } = this.props;
    const maxScoreDisabled = scoreType !== FEEDBACK_MANUAL_SCORE;

    return (
      <Modal animation={false} backdrop={backdrop} centered dialogClassName={css.lightbox} onHide={onHide} show={show} data-cy="feedback-settings-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="feedback-settings-modal-header">
          <div className={css.title} data-cy="feedback-settings-modal-header-text">
            Activity Score Settings
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="feedback-settings-modal-content-area">
            <div className={css.modalOption} data-cy="feedback-settings-modal-option">
              <FeedbackSettingsModalButton selected={scoreType === FEEDBACK_NO_SCORE} value={FEEDBACK_NO_SCORE} onClick={this.handleScoreTypeChange} label="No score" />
            </div>
            <div className={css.modalOption} data-cy="feedback-settings-modal-option">
              <FeedbackSettingsModalButton selected={scoreType === FEEDBACK_MANUAL_SCORE} value={FEEDBACK_MANUAL_SCORE} onClick={this.handleScoreTypeChange} label="Manual score">
                <div className={classNames(css.maxScore, {[css.disabled]: maxScoreDisabled})}>
                  <div>Max score</div>
                  <input type="number" disabled={maxScoreDisabled} defaultValue={10} min={1} />
                </div>
              </FeedbackSettingsModalButton>
              <div className={css.modalOptionInfo}>
                <p>
                  All activities within this assignment can be scored up to your specified max score.
                </p>
                <p>
                  You may also choose <strong>not to score</strong> any student’s activities by not entering values in the entry fields.
                </p>
              </div>
            </div>
            <div className={css.modalOption} data-cy="feedback-settings-modal-option">
              <FeedbackSettingsModalButton selected={scoreType === FEEDBACK_RUBRIC_SCORE} value={FEEDBACK_RUBRIC_SCORE} onClick={this.handleScoreTypeChange} label="Score with rubric" />
              <div className={css.modalOptionInfo}>
                <p>
                  All activities within this assignment will receive a score based on the activity-level rubric scores you’ve entered.
                </p>
              </div>
            </div>
            <div className={css.buttonContainer}>
              <div className={css.closeButton} onClick={this.handleCancel} data-cy="feedback-settings-modal-close-button">
                Cancel
              </div>
              <div className={css.closeButton} onClick={this.handleSave} data-cy="feedback-settings-modal-close-button">
                Save
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  private handleCancel = () => {
    this.close();
  }

  private handleSave = () => {
    // TBD: in future PR save the values
    this.close();
  }

  private close = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }

}
