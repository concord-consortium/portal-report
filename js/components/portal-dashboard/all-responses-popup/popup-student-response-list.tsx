import React from "react";
import Answer from "../../../containers/portal-dashboard/answer";
import { getFormattedStudentName } from "../../../util/student-utils";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-student-response-list.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
  currentQuestion:  Map<string, any>;
}

export class PopupStudentResponseList extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, currentQuestion } = this.props;
    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        {students && students.map((student: any, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);

          return (
            <div className={css.studentRow} key={`student ${i}`} data-cy="student-row">
              {this.renderStudentNameWrapper(formattedName)}
              <div className={`${css.studentResponse}`}data-cy="student-response">
                  <Answer question={currentQuestion} student={student} inPopup={true}/>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderStudentNameWrapper(formattedName: string) {
    return (
      <div className={`${css.studentWrapper}`}>
        <div className={css.spotlightSelectionCheckbox} data-cy="spotlight-selection-checkbox"></div>
        <div className={css.studentName} data-cy="student-name">{formattedName}</div>
      </div>
    );
  }
}
