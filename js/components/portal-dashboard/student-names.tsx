import React from "react";

import css from "../../../css/portal-dashboard/student-names.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
}

export class StudentNames extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous } = this.props;
    return (
      <div className={css.studentList} data-cy="student-list">
        { students && students.map((student: any, i: number) => {
          const formattedName = isAnonymous
                                ? `Student ${student.get("id")}`
                                : `${student.get("lastName")}, ${student.get("firstName")}`;
          return (
            <div className={css.studentName} key={`student ${i}`}>
              <div className={css.name}>{formattedName}</div>
            </div>
          );
        }) }
      </div>
    );
  }
}
