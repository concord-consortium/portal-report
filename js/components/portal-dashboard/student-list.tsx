import React from "react";
import { StudentRow } from "./student-row";

import css from "../../../css/portal-dashboard/student-list.less";

interface IProps {
  students: any; // TODO: temporary, update props as component is built
}

export class StudentList extends React.PureComponent<IProps> {
  render() {
    const { students } = this.props;
    return (
      <div className={css.studentList}>
        { students && students.map((student: any, i: number) => (
          <StudentRow key={`student ${i}`} name={student.get("name")}/>
        )) }
      </div>
    );
  }
}
