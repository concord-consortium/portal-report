import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { TrackEventFunction } from "../../actions";
import ArrowIcon from "../../../img/svg-icons/arrow-icon.svg";
import { getAnswersByQuestion } from "../../selectors/report-tree";
import MultipleChoiceAnswer from "./multiple-choice-answer";

import css from "../../../css/portal-dashboard/overlay-class-response.less";

interface IProps {
  answers: Map<string, any>;
  currentQuestion: Map<string, any>;
  students: any;
  trackEvent: TrackEventFunction;
}

interface IState {
  hideResponseArea: boolean;
}

export class ClassResponse extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      hideResponseArea: false
    };
  }

  render() {
    const chevronClass = this.state.hideResponseArea ? `${css.arrow} ${css.hideResponseArea}`:`${css.arrow}`;
    const responseAreaClass = this.state.hideResponseArea ? `${css.responseArea} ${css.hidden}` : `${css.responseArea}`;

    return (
      <div className={css.classResponse} data-cy="overlay-class-response-area">
        <div className={css.responseHeader}>
          <div className={css.title} data-cy="class-response-title">Class Response</div>
          <div className={css.showHideButton} onClick={this.handleChevronClick} data-cy="show-hide-class-response-button">
            <ArrowIcon className={chevronClass} />
          </div>
        </div>
        <div className={responseAreaClass} data-cy="class-response-content">
          {this.renderResponseArea()}
        </div>
      </div>
    );
  }

  private handleChevronClick = () => {
    this.setState({
      hideResponseArea: !this.state.hideResponseArea
    });
  }

  private renderResponseArea = () => {
    const { currentQuestion, students, answers } = this.props;
    if (!currentQuestion || !students) return null;

    // For now, multiple-choice questions are the only question types for which we show class responses.
    return (
      <MultipleChoiceAnswer
        answers={answers}
        inQuestionDetailsPanel={true}
        question={currentQuestion}
        students={students}
      />
    );
  }
}

function mapStateToProps(state: any, ownProps: any) {
  const questionId = ownProps.currentQuestion?.get("id");
  if (!questionId) {
    return { answers: Map() };
  }

  const answers = getAnswersByQuestion(state).get(questionId) || Map();

  return { answers };
}

export default connect(mapStateToProps)(ClassResponse);
