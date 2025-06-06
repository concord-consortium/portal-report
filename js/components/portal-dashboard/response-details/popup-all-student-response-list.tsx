import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";
import { SelectedStudent } from "./response-details";
import { TrackEventFunction } from "../../../actions";
import { LastRunRow } from "../last-run-row";

import css from "../../../../css/portal-dashboard/response-details/popup-student-response-list.less";
// Import shared styles for visual consistency of "Last Run" column.
import lastRunCss from "../../../../css/portal-dashboard/last-run-column.less";

interface IProps {
  answers: Map<any, any>;
  currentQuestion?: Map<string, any>;
  hideLastRun: boolean;
  isAnonymous: boolean;
  isCompact: boolean;
  onStudentSelect: (studentId: string) => void;
  selectedStudents: SelectedStudent[];
  students: Map<any, any>;
  trackEvent: TrackEventFunction;
}

export class PopupStudentResponseList extends React.PureComponent<IProps> {
  render() {
    const { answers, hideLastRun, isCompact, students, isAnonymous, currentQuestion, selectedStudents, trackEvent } = this.props;
    const compactClass = isCompact ? lastRunCss.compact : "";

    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        { students?.map((student: Map<any, any>, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);
          const isSelected = selectedStudents.findIndex((s) => s.id === student.get("id")) >= 0;
          const answer = currentQuestion && answers.getIn([currentQuestion.get("id"), student.get("id")]);
          const spotlightAllowed = answer != null;
          return (
            <div className={css.listRow} key={`student ${i}`} data-cy="student-row">
              {this.renderStudentNameWrapper(student.get("id"), formattedName, isSelected, spotlightAllowed)}
              {!hideLastRun &&
                <div className={`${lastRunCss.lastRunColumn} ${compactClass}`} data-cy="last-run-column">
                  <LastRunRow lastRun={student.get("lastRun")} showBorders={true} />
                </div>
              }
              <div className={`${css.studentResponse} ${isSelected ? css.selected : ""}`} data-cy="student-response">
                <Answer
                  question={currentQuestion}
                  student={student}
                  responsive={false}
                  studentName={formattedName}
                  trackEvent={trackEvent}
                  answerOrientation="wide"
                />
              </div>
            </div>
          );
        }) }
      </div>
    );
  }

  private renderStudentNameWrapper(studentId: string, formattedName: string, selected: boolean, spotlightAllowed: boolean) {
    return (
      <div className={`${css.itemWrapper} ${selected ? css.selected : ""}`}>
        <div className={css.checkboxListItem}>
          <div onClick={this.handleSelect(studentId)} className={`${css.spotlightSelectionCheckbox} ${!spotlightAllowed ? css.disabled : ""}`} data-cy="spotlight-selection-checkbox">
            <div className={`${css.check} ${selected ? css.selected : ""}`} />
          </div>
          <div className={css.studentName} data-cy="student-name">{formattedName}</div>
        </div>
      </div>
    );
  }

  private handleSelect = (studentId: string) => () => {
    this.props.onStudentSelect(studentId);
  }

}
