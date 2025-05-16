import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "./question-navigator";
import ClassResponse from "./overlay-class-response";
import { StudentResponse } from "./overlay-student-response";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import QuestionPopoutIcon from "../../../img/svg-icons/question-popout-icon.svg";
import { DashboardViewMode, ListViewMode } from "../../util/misc";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  setDashboardViewMode: (mode: DashboardViewMode) => void;
  setListViewMode: (mode: ListViewMode) => void;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  setCurrentActivity: (activityId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
  sortedQuestionIds?: string[];
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
  hasTeacherEdition: boolean;
  trackEvent: TrackEventFunction;
}

export class QuestionOverlay extends React.PureComponent<IProps> {
  render() {
    const { students, currentActivity, currentQuestion, isAnonymous, currentStudentId, trackEvent } = this.props;
    // For now, we only show the Class Response section for multiple choice questions
    const showClassResponse = currentQuestion?.get("type") === "multiple_choice";

    return (
      <div className={`${css.questionOverlay} ${(currentQuestion && currentActivity ? css.visible : "")}`} data-cy="question-overlay">
        { currentQuestion && this.renderQuestionDetails() }
        { showClassResponse &&
          <ClassResponse
            currentQuestion={currentQuestion}
            students={students}
            trackEvent={() => null}
          />
        }
        { currentQuestion &&
          <StudentResponse
            students={students}
            isAnonymous={isAnonymous}
            currentQuestion={currentQuestion}
            setCurrentStudent={this.handleChangeStudent}
            currentStudentId={currentStudentId}
            trackEvent={trackEvent}
          />
        }
      </div>
    );
  }

  private renderQuestionDetails = () => {
    const { currentQuestion, questions, sortedQuestionIds, setCurrentActivity, hasTeacherEdition, trackEvent } = this.props;
    return (
      <React.Fragment>
        <div className={css.header} data-cy="question-overlay-header">
          <div className={css.questionDetailButton} onClick={this.dismissCurrentQuestion} data-cy="question-overlay-header-button">
            <QuestionPopoutIcon className={css.icon} />
            <div>Question Details</div>
          </div>
          {this.renderAllResponsesButton()}
        </div>
        <QuestionNavigator
          currentQuestion={currentQuestion}
          questions={questions}
          sortedQuestionIds={sortedQuestionIds}
          toggleCurrentQuestion={this.toggleCurrentQuestion}
          setCurrentActivity={setCurrentActivity}
          inOverlay={true}
          hasTeacherEdition={hasTeacherEdition}
          trackEvent={trackEvent}
        />
      </React.Fragment>
    );
  }

  private handleChangeStudent = (studentId: string) => {
    this.props.setCurrentStudent(studentId);
    this.props.trackEvent("Portal-Dashboard", "QuestionOverlayChangeStudent", {label: studentId});
  }

  private toggleCurrentQuestion = (questionId: string) => {
    this.props.toggleCurrentQuestion(questionId);
    this.props.trackEvent("Portal-Dashboard", "QuestionOverlayChangeQuestion", {label: questionId});
  }

  private dismissCurrentQuestion = () => {
    if (this.props.currentQuestion) {
      const questionId = this.props.currentQuestion.get("id");
      this.props.toggleCurrentQuestion(questionId);
      this.props.trackEvent("Portal-Dashboard", "DismissQuestionOverlay", {label: questionId});
    }
  }

  private renderAllResponsesButton = () => {
    return (
      <div className={css.openPopupButton} data-cy="view-all-student-responses-button" onClick={this.handleShowAllResponsesButtonClick}>
        <GroupIcon className={css.icon} />
        <span>View All Responses</span>
      </div>
    );
  }

  private handleShowAllResponsesButtonClick = () => {
    this.props.setDashboardViewMode("ResponseDetails");
    this.props.setListViewMode("Student");
    this.props.trackEvent("Portal-Dashboard", "ShowAllResponses");
  }
}
