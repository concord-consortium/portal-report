import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";
import { Map } from "immutable";
import { FeedbackSettingsModalButton } from "./feedback-settings-modal-button";
import { Rubric } from "./rubric-utils";
import { updateActivityFeedbackSettings } from "../../../actions";
import { connect } from "react-redux";
import { MANUAL_SCORE, NO_SCORE, RUBRIC_SCORE } from "../../../util/scoring-constants";
import { ScoreType, getScoringSettings } from "../../../util/scoring";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-modal.less";

interface IProps {
  onHide: (value: boolean) => void;
  show: boolean;
  activity: Map<any, any>;
  activityIndex: number;
  activityId: string;
  feedbackSettings: Map<any, any>;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  rubric?: Rubric;
}

interface IState {
  scoreType: string;
  maxScore: number;
}

class FeedbackSettingsModal extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = this.getSettings();
  }

  render() {
    const { scoreType, maxScore } = this.state;
    const { show, rubric } = this.props;
    const maxScoreDisabled = scoreType !== MANUAL_SCORE;

    return (
      <Modal animation={false} centered dialogClassName={css.lightbox} onHide={this.handleCancel} show={show} data-cy="feedback-settings-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="feedback-settings-modal-header">
          <div className={css.title} data-cy="feedback-settings-modal-header-text">
            Activity Score Settings
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="feedback-settings-modal-content-area">
            <div className={css.modalOption} data-cy="feedback-settings-modal-option">
              <FeedbackSettingsModalButton selected={scoreType === NO_SCORE} value={NO_SCORE} onClick={this.handleScoreTypeChange} label="No score" />
            </div>
            <div className={css.modalOption} data-cy="feedback-settings-modal-option">
              <FeedbackSettingsModalButton selected={scoreType === MANUAL_SCORE} value={MANUAL_SCORE} onClick={this.handleScoreTypeChange} label="Manual score">
                <div className={classNames(css.maxScore, {[css.disabled]: maxScoreDisabled})}>
                  <div>Max score</div>
                  <input type="number" disabled={maxScoreDisabled} value={maxScore} onChange={this.handleMaxScoreChange} min={1} />
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
            {rubric && (
              <div className={css.modalOption} data-cy="feedback-settings-modal-option">
                <FeedbackSettingsModalButton selected={scoreType === RUBRIC_SCORE} value={RUBRIC_SCORE} onClick={this.handleScoreTypeChange} label="Score with rubric" />
                <div className={css.modalOptionInfo}>
                  <p>
                    All activities within this assignment will receive a score based on the activity-level rubric scores you’ve entered.
                  </p>
                </div>
              </div>
            )}
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

  private getSettings = () => {
    const settings = this.props.feedbackSettings.toJS() as any;
    return getScoringSettings(settings, {rubric: this.props.rubric});
  }

  private handleScoreTypeChange = (scoreType: ScoreType) => {
    this.setState({ scoreType });
  }

  private handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxScore = parseInt(e.target.value, 10);
    if (maxScore > 0) {
      this.setState({ maxScore });
    }
  }

  private handleCancel = () => {
    // restore initial settings
    this.setState(this.getSettings());
    this.close();
  }

  private handleSave = () => {
    const {scoreType, maxScore} = this.state;
    const {updateActivityFeedbackSettings, activityId, activityIndex} = this.props;
    updateActivityFeedbackSettings(activityId, activityIndex, { scoreType, maxScore });
    this.close();
  }

  private close = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }
}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    const activityId = ownProps.activity.get("id");
    const feedbackSettings = state.getIn(["feedback", "settings", "activitySettings", activityId]) || Map({});

    return {
      feedbackSettings,
      rubric: rubric && rubric.toJS(),
      activityId,
      activityIndex: ownProps.activity.get("activityIndex"),
    };
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackSettingsModal);
