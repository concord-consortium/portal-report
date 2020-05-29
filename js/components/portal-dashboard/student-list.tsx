import React from "react";
import { StudentRow } from "./student-row";

import css from "../../../css/portal-dashboard/student-list.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
}

export class StudentList extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous } = this.props;
    return (
      <div className={css.studentList} data-cy="student-list">
        { students && students.map((student: any, i: number) => {
          const formattedName = isAnonymous
                                ? `Student ${i + 1}`
                                : `${student.get("lastName")}, ${student.get("firstName")}`;
          return (
            <StudentRow key={`student ${i}`} name={formattedName}/>
          );
        }) }
      </div>
    );
  }
}
