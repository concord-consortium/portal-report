import React, { PureComponent } from "react";
import { Modal } from "react-bootstrap";
import { Map } from "immutable";
import { FeedbackSettingsModalButton } from "./feedback-settings-modal-button";
import { Rubric } from "./rubric-utils";
import { updateActivityFeedbackSettings } from "../../../actions";
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
}

interface IState {
  scoreType: string;
  maxScore: number;
}

class FeedbackSettingsModal extends PureComponent<IProps, IState> {
  private initialSettings: IState;

  constructor(props: IProps) {
    super(props);
    this.initialSettings = props.scoringSettings;
    this.state = {...props.scoringSettings};
  }

  render() {
    const { scoreType, maxScore } = this.state;
    const { show, rubric } = this.props;
    const maxScoreDisabled = scoreType !== MANUAL_SCORE;
    const hasScoredQuestions = getScoredQuestions(this.props.activity).size > 0;

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
                    All activities within this assignment will receive a score based on the activity-level rubric scores you’ve entered.
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
              <div className={css.closeButton} onClick={this.handleSave} data-cy="feedback-settings-modal-close-button">
                Save
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  private handleScoreTypeChange = (scoreType: ScoreType) => {
    this.setState({ scoreType });
  }

  private handleMaxScoreChange = (maxScore: number) => {
    this.setState({ maxScore });
  }

  private handleCancel = () => {
    // restore initial settings
    this.setState(this.initialSettings);
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

    return {
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

