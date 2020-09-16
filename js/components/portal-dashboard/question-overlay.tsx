import React from "react";
import { Map } from "immutable";
import { QuestionNavigator } from "./question-navigator";
// Removed for MVP: import { ClassResponse } from "./overlay-class-response";
import { StudentResponse } from "./overlay-student-response";
import GroupIcon from "../../../img/svg-icons/group-icon.svg";
import QuestionPopoutIcon from "../../../img/svg-icons/question-popout-icon.svg";

import css from "../../../css/portal-dashboard/question-overlay.less";

interface IProps {
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  currentStudentId: string | null;
  handleShowAllResponsesPopup: (show: boolean) => void;
  isAnonymous: boolean;
  questions?: Map<string, any>;
  setCurrentActivity: (activityId: string) => void;
  setCurrentStudent: (studentId: string | null) => void;
  sortedQuestionIds?: string[];
  students: any;
  toggleCurrentQuestion: (questionId: string) => void;
}

export class QuestionOverlay extends React.PureComponent<IProps> {
  render() {
    const { students, currentQuestion, isAnonymous, setCurrentStudent, currentStudentId } = this.props;
    return (
      <div className={`${css.questionOverlay} ${(currentQuestion ? css.visible : "")}`} data-cy="question-overlay">
        { currentQuestion && this.renderQuestionDetails() }
        {/* Removed for MVP: { currentQuestion && <ClassResponse currentQuestion={currentQuestion}/> } */}
        { currentQuestion &&
          <StudentResponse
            students={students}
            isAnonymous={isAnonymous}
            currentQuestion={currentQuestion}
            setCurrentStudent={setCurrentStudent}
            currentStudentId={currentStudentId}
          />
        }
        {this.renderFooter()}
      </div>
    );
  }

  private renderQuestionDetails = () => {
    const { currentActivity, currentQuestion, questions, sortedQuestionIds, toggleCurrentQuestion, setCurrentActivity } = this.props;
    return (
      <React.Fragment>
        <div className={css.header} onClick={this.dismissCurrentQuestion} data-cy="question-overlay-header">
          <QuestionPopoutIcon className={css.icon} />
          <div>Question Detail View</div>
        </div>
        <QuestionNavigator
          currentActivity={currentActivity}
          currentQuestion={currentQuestion}
          questions={questions}
          sortedQuestionIds={sortedQuestionIds}
          toggleCurrentQuestion={toggleCurrentQuestion}
          setCurrentActivity={setCurrentActivity}
          inOverlay={true}
        />
      </React.Fragment>
    );
  }

  private dismissCurrentQuestion = () => {
    if (this.props.currentQuestion) {
      this.props.toggleCurrentQuestion(this.props.currentQuestion.get("id"));
    }
  }

  private renderFooter = () => {
    return (
      <div className={css.footer}>
        <div className={css.openPopupButton} data-cy="view-all-student-responses-button" onClick={this.handleShowAllResponsesButtonClick}>
          <GroupIcon className={css.icon} />
          <span>View All Student Responses</span>
        </div>
      </div>
    );
  }

  private handleShowAllResponsesButtonClick = () => {
    this.props.handleShowAllResponsesPopup(true);
  }
}
