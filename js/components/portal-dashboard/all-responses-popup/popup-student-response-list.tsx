import React from "react";
import { getFormattedStudentName } from "../../../util/student-utils";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-student-response-list.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
}

export class PopupStudentResponseList extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous } = this.props;
    return (
      <div className={css.responseTable} data-cy="popup-response-table">
        {students && students.map((student: any, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);

          return (
            <div className={css.studentRow} key={`student ${i}`} data-cy="student-row">
              {this.renderStudentNameWrapper(formattedName)}
              <div className={`${css.studentResponse}`}data-cy="student-response">
                <div className={`${css.studentResponseText} `}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
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
