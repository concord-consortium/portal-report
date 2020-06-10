import React from "react";

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
        { students && students.map((student: any, i: number) => {
          const formattedName = isAnonymous
                                ? student.get("name")
                                : `${student.get("lastName")}, ${student.get("firstName")}`;
          return (
            <div className={`${css.studentName} ${compactClass}`} key={`student ${i}`}>
              <div className={css.name} data-cy="student-name">{formattedName}</div>
            </div>
          );
        }) }
      </div>
    );
  }
}
