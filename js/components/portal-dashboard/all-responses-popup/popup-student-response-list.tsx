import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-student-response-list.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  isAnonymous: boolean;
  onStudentSelect: (student: Map<any, any>) => void;
  selectedStudents: Map<any, any>[];
  students: Map<any, any>;
}

export class PopupStudentResponseList extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, currentQuestion, selectedStudents } = this.props;
    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        { students?.map((student: Map<any, any>, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);
          const isSelected = selectedStudents.findIndex((s: Map<any, any>) => s.get("id") === student.get("id")) >= 0;
          return (
            <div className={css.studentRow} key={`student ${i}`} data-cy="student-row">
              {this.renderStudentNameWrapper(student, formattedName, isSelected)}
              <div className={css.studentResponse} data-cy="student-response">
                <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
              </div>
            </div>
          );
        }) }
      </div>
    );
  }

  private renderStudentNameWrapper(student: Map<any, any>, formattedName: string, selected: boolean) {
    return (
      <div className={css.studentWrapper}>
        <div onClick={this.handleSelect(student)} className={css.spotlightSelectionCheckbox} data-cy="spotlight-selection-checkbox">
          {selected && <div className={css.selected} />}
        </div>
        <div className={css.studentName} data-cy="student-name">{formattedName}</div>
      </div>
    );
  }

  private handleSelect = (student: Map<any, any>) => () => {
    this.props.onStudentSelect(student);
  }
}
