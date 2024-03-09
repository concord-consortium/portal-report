import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import { Map } from "immutable";
import classNames from "classnames";
import { FeedbackSettingsModalButton } from "./feedback-settings-modal-button";
import { Rubric } from "./rubric-utils";
import { TrackEventFunction, updateActivityFeedbackSettings } from "../../../actions";
import { connect } from "react-redux";
import { AUTOMATIC_SCORE, MANUAL_SCORE, NO_SCORE, RUBRIC_SCORE } from "../../../util/scoring-constants";
import { ScoreType, ScoringSettings, getScoredQuestions } from "../../../util/scoring";
import { ScoreInput } from "./score-input";

import css from "../../../../css/portal-dashboard/feedback/feedback-settings-modal.less";

interface IProps {
  onHide: (value: boolean) => void;
  show: boolean;
  activity: Map<any, any>;
  activityIndex: number;
  activityId: string;
  scoringSettings: ScoringSettings;
  updateActivityFeedbackSettings: (activityId: string, activityIndex: number, feedbackFlags: any) => void;
  rubric?: Rubric;
  feedbacks: any;
  trackEvent: TrackEventFunction;
}

interface IState {
  scoreType: string;
  maxScore: number;
  confirmMaxScore: boolean;
}

class FeedbackSettingsModal extends PureComponent<IProps, IState> {
  private initialSettings: IState;

  constructor(props: IProps) {
    super(props);
    this.initialSettings = {
      ...props.scoringSettings,
      confirmMaxScore: false,
    };
    this.state = {...this.initialSettings};
  }

  render() {
    const { confirmMaxScore } = this.state;
    const { show } = this.props;

    return (
      <Modal animation={false} centered dialogClassName={css.lightbox} onHide={this.handleCancel} show={show} data-cy="feedback-settings-modal">
        <Modal.Header className={css.lightboxHeader} data-cy="feedback-settings-modal-header">
          <div className={css.title} data-cy="feedback-settings-modal-header-text">
            Activity Score Settings
          </div>
        </Modal.Header>
        <Modal.Body className={css.lightboxBody}>
          <div className={css.contentArea} data-cy="feedback-settings-modal-content-area">
            {!confirmMaxScore && this.renderOptions()}
            {confirmMaxScore && this.renderConfirmMaxScore()}
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  renderOptions() {
    const { scoreType, maxScore } = this.state;
    const { rubric } = this.props;
    const maxScoreDisabled = scoreType !== MANUAL_SCORE;
    const hasScoredQuestions = getScoredQuestions(this.props.activity).size > 0;

    return (
      <>
        <div className={css.modalOption} data-cy="feedback-settings-modal-option">
          <FeedbackSettingsModalButton selected={scoreType === NO_SCORE} value={NO_SCORE} onClick={this.handleScoreTypeChange} label="No score" />
        </div>
        <div className={css.modalOption} data-cy="feedback-settings-modal-option">
          <FeedbackSettingsModalButton selected={scoreType === MANUAL_SCORE} value={MANUAL_SCORE} onClick={this.handleScoreTypeChange} label="Manual score">
            <ScoreInput score={maxScore} minScore={1} disabled={maxScoreDisabled} className={css.maxScore} onChange={this.handleMaxScoreChange}>
              <div>Max score</div>
            </ScoreInput>
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
            <FeedbackSettingsModalButton selected={scoreType === RUBRIC_SCORE} value={RUBRIC_SCORE} onClick={this.handleScoreTypeChange} label="Use score from rubric" />
            <div className={css.modalOptionInfo}>
              <p>
                All activities within this assignment will receive a score based on the activity-level rubric scores you’ve selected.
              </p>
            </div>
          </div>
        )}
        {hasScoredQuestions && (
          <div className={css.modalOption} data-cy="feedback-settings-modal-option">
            <FeedbackSettingsModalButton selected={scoreType === AUTOMATIC_SCORE} value={AUTOMATIC_SCORE} onClick={this.handleScoreTypeChange} label="Use score from autoscored multiple-choice questions" alignTop={true} />
            <div className={css.modalOptionInfo}>
              <p>
              All activities within this assignment will receive a score based on the total score of autoscored multiple-choice questions.
              </p>
            </div>
          </div>
        )}
        <div className={css.buttonContainer}>
          <div className={css.closeButton} onClick={this.handleCancel} data-cy="feedback-settings-modal-close-button">
            Cancel
          </div>
          <div className={classNames(css.closeButton, {[css.disabled]: this.saveDisabled})} onClick={this.handleSave} data-cy="feedback-settings-modal-close-button">
            Save
          </div>
        </div>
      </>
    );
  }

  renderConfirmMaxScore() {
    const { maxScore } = this.state;

    return (
      <>
        <p>
          Some of the current student scores will be above the new max score of {maxScore}.
        </p>
        <div className={css.buttonContainer}>
          <div className={css.closeButton} onClick={this.handleCancel} data-cy="feedback-settings-modal-close-button">
            Cancel
          </div>
          <div className={classNames(css.closeButton)} onClick={this.handleSave} data-cy="feedback-settings-modal-close-button">
            Continue
          </div>
        </div>
      </>
    );
  }

  private handleScoreTypeChange = (scoreType: ScoreType) => {
    this.setState({ scoreType });
  }

  private handleMaxScoreChange = (maxScore: number) => {
    this.setState({ maxScore });
  }

  private handleCancel = () => {
    if (this.state.confirmMaxScore) {
      this.setState({ confirmMaxScore: false });
    } else {
      // restore initial settings
      this.setState(this.initialSettings);
      this.close();
    }
  }

  private handleSave = () => {
    const {scoreType, maxScore, confirmMaxScore} = this.state;
    const {updateActivityFeedbackSettings, activityId, activityIndex, feedbacks} = this.props;
    if (!this.saveDisabled) {
      const updates: any = { scoreType };
      if (maxScore !== undefined) {
        // check if scores above max score and confirm if they are
        const scoresAboveMax = feedbacks.scores.reduce((acc: boolean, cur: number) => {
          return acc || cur > maxScore;
        }, false);
        if (scoresAboveMax && !confirmMaxScore) {
          this.setState({ confirmMaxScore: true });
          return;
        }

        updates.maxScore = maxScore;
      }
      this.props.trackEvent("Portal-Dashboard", "SetActivityScoreSetting", {label: activityId, parameters: {...updates}});
      updateActivityFeedbackSettings(activityId, activityIndex, updates);
      this.setState({ confirmMaxScore: false });
      this.close();
    }
  }

  private close = () => {
    const { show, onHide } = this.props;
    if (show) {
      onHide(show);
    }
  }

  private get saveDisabled() {
    const { scoreType, maxScore } = this.state;
    return scoreType === MANUAL_SCORE && (maxScore === undefined || maxScore < 1);
  }
}

function mapStateToProps() {
  return (state: any, ownProps: any) => {
    const rubric = state.getIn(["feedback", "settings", "rubric"]);
    const activityId = ownProps.activity.get("id");

    return {
      rubric: rubric && rubric.toJS(),
      activityId,
      activityIndex: ownProps.activity.get("activityIndex"),
    };
  };
}

const mapDispatchToProps = (dispatch: any): Partial<IProps> => {
  return {
    updateActivityFeedbackSettings: (activityId, activityIndex, feedbackFlags) => dispatch(updateActivityFeedbackSettings(activityId, activityIndex, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackSettingsModal);

