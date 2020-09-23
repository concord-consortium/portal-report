import React from "react";
import { Map } from "immutable";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-student-response-list.less";

interface IProps {
  currentQuestion?: Map<string, any>;
  isAnonymous: boolean;
  onStudentSelect: (student: Map<any, any>) => void;
  students: Map<any, any>;
}

export class PopupStudentResponseList extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, currentQuestion } = this.props;
    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        { students?.map((student: Map<any, any>, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);
          return (
            <div className={css.studentRow} key={`student ${i}`} data-cy="student-row">
              {this.renderStudentNameWrapper(student, formattedName)}
              <div className={css.studentResponse} data-cy="student-response">
                <Answer question={currentQuestion} student={student} responsive={false} studentName={formattedName} />
              </div>
            </div>
          );
        }) }
      </div>
    );
  }

  private renderStudentNameWrapper(student: Map<any, any>, formattedName: string) {
    return (
      <div className={css.studentWrapper}>
        <div onClick={this.handleSelect(student)} className={css.spotlightSelectionCheckbox} data-cy="spotlight-selection-checkbox"></div>
        <div className={css.studentName} data-cy="student-name">{formattedName}</div>
      </div>
    );
  }

  private handleSelect = (student: Map<any, any>) => () => {
    this.props.onStudentSelect(student);
  }
}
