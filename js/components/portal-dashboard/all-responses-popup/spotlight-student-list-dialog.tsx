import React from "react";
import { Map } from "immutable";
import { AnonymizeStudents } from "../anonymize-students";
import { QuestionTypes } from "../../../util/question-utils";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";
import striptags from "striptags";
import SpotlightIcon from "../../../../img/svg-icons/spotlight-icon.svg";
import AssignmentIcon from "../../../../img/svg-icons/assignment-icon.svg";
import SmallCloseIcon from "../../../../img/svg-icons/small-close-icon.svg";

import css from "../../../../css/portal-dashboard/all-responses-popup/spotlight-student-list-dialog.less";

interface IProps {
  anonymous: boolean;
  currentActivity?: Map<string, any>;
  currentQuestion?: Map<string, any>;
  isAnonymous: boolean;
  onCloseDialog: (show: boolean) => void;
  onStudentSelect: (studentId: string) => void;
  selectedStudentIds: string[];
  setAnonymous: (value: boolean) => void;
  students: Map<any, any>;
}
export class SpotlightStudentListDialog extends React.PureComponent<IProps>{
  render() {
    return (
      <div className={css.spotlightListDialog} data-cy="spotlight-student-list-dialog">
        {this.renderSpotlightListHeader()}
        {this.renderColumnHeaders()}
        {this.renderStudentAnswers()}
      </div>
    );
  }

  private renderSpotlightListHeader = () => {
    const { currentActivity, onCloseDialog } = this.props;
    const activityName = currentActivity?.get("name");
    return (
      <div className={css.spotlightListHeader}>
        <div className={css.headerLeft}>
          <SpotlightIcon className={css.spotlightIcon} />
        </div>
        <div className={css.headerCenter}>
          <div className={css.assignmentContainer}>
            <AssignmentIcon className={`${css.assignmentIcon} ${css.icon}`} />
            <div className={css.title} data-cy="popup-header-title">{activityName}</div>
          </div>
        </div>
        <div className={css.headerRight}>
          <div className={css.closeIcon} data-cy="close-popup-button" onClick={() => onCloseDialog(false)}>
            <SmallCloseIcon className={css.closeIconSVG} />
          </div>
        </div>
      </div>
    );
  }

  private renderColumnHeaders = () => {
    const { anonymous, setAnonymous, currentQuestion } = this.props;
    const type = currentQuestion?.get("type");
    const questionType = QuestionTypes.find(qt => qt.type === type);
    const QuestionIcon = questionType?.icon;
    const typeText = type && type.replace(/_/gm, ' ');
    const interactiveName = type === "iframe_interactive" ? currentQuestion?.get("name") : typeText;
    const prompt = currentQuestion?.get("prompt");
    const prompText = prompt ? striptags(prompt.replace(/&nbsp;/g, ' ')) : interactiveName;

    return (
      <div className={css.spotlightColumnHeaders} data-cy="select-student-header">
        <div className={css.anonymizeContainer}>
          <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
        </div>
        <div className={css.questionPrompt} data-cy="question-prompt">
          <QuestionIcon className={`${css.icon} ${css.questionTypeIcon}`} />
          <span className={css.questionPromptText} data-cy="question-prompt-text">
            {prompText}
          </span>
        </div>
      </div>
    );
  }

  private renderStudentAnswers = () => {
    const { currentQuestion, isAnonymous, selectedStudentIds, students } = this.props;
    return (
      <div className={css.selectedStudentResponseTable} data-cy="popup-response-table">
        { students?.filter((student: Map<any, any>) => selectedStudentIds.findIndex((id: string) => id === student.get("id")) >= 0)
                   .map((student: Map<any, any>, i: number) => {
            const formattedName = getFormattedStudentName(isAnonymous, student);
            return (
              <div className={css.studentRow} key={`student ${i}`} data-cy="student-row">
                {this.renderStudentNameWrapper(student.get("id"), formattedName)}
                <div className={css.studentResponse} data-cy="student-response">
                  <Answer question={currentQuestion} student={student} responsive={false} />
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }

  private renderStudentNameWrapper(studentId: string, formattedName: string) {
    return (
      <div className={css.studentWrapper}>
        <div onClick={this.handleSelect(studentId)} className={css.spotlightSelectionCheckbox} data-cy="spotlight-selection-checkbox">
          <div className={css.check} />
        </div>
        <div className={css.spotlightBadge}>
          <SpotlightIcon className={css.listSpotlightIcon} />
        </div>
        <div className={css.studentName} data-cy="student-name">{formattedName}</div>
      </div>
    );
  }

  private handleSelect = (studentId: string) => () => {
    this.props.onStudentSelect(studentId);
  }

}
