import React from "react";
import { getFormattedStudentName } from "../../util/student-utils";

import css from "../../../css/portal-dashboard/student-names.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
  isCompact: boolean;
}

export class StudentNames extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, isCompact } = this.props;
    const compactClass = isCompact ? css.compact : "";

    return (
      <div className={css.studentList} data-cy="student-list">
        { students?.map((student: any, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);
          return (
            <div className={`${css.studentName} ${compactClass}`} key={`student ${i}`}>
              <div key={`student ${i}`}>
                <div className={css.name} data-cy="student-name">{formattedName}</div>
              </div>
            </div>
          );
        }) }
      </div>
    );
  }
}
