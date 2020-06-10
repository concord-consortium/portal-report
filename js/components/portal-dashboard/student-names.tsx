/* eslint-disable no-console */
/* eslint-disable prefer-const */
import React from "react";

import css from "../../../css/portal-dashboard/student-names.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
  isAllResponsesReport: boolean;
}

export class StudentNames extends React.PureComponent<IProps> {
  render() {
    let rowClass = css.studentNameRow;
    console.log("isAllResponsesReport: " + this.props.isAllResponsesReport);

    const { students, isAnonymous } = this.props;
    return (
      <div className={css.studentList} data-cy="student-list">
        {students && students.map((student: any, i: number) => {
          const formattedName = isAnonymous
            ? student.get("name")
            : `${student.get("lastName")}, ${student.get("firstName")}`;
          this.props.isAllResponsesReport ?
            rowClass += " " + css.allResponseReport : "";
          return (
            <div className={rowClass} key={`student ${i}`}>
              {this.props.isAllResponsesReport && this.renderSelectionCheckbox()}
              <div className={css.name} data-cy="student-name">{formattedName}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderSelectionCheckbox = () => {
    return (
      <div className={css.checkbox}></div>
    );
  }
}
