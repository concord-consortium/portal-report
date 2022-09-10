import React, { PureComponent } from "react";

import css from "../../../css/dashboard/student-name.less";

export default class StudentName extends PureComponent {
  constructor(props) {
    super(props);
    this.onStudentNameClick = this.onStudentNameClick.bind(this);
  }

  onStudentNameClick() {
    const { student, studentExpanded, setStudentExpanded, trackEvent } = this.props;
    setStudentExpanded(student.get("id"), !studentExpanded);
    const trackAction = studentExpanded ? "Closed Student Row" : "Opened Student Row";
    trackEvent("Dashboard", trackAction);
  }

  render() {
    const { student, expanded } = this.props;
    return (
      <div className={css.studentName + " " + (expanded ? css.expanded : "")} onClick={this.onStudentNameClick} data-cy="studentName">
        <div className={css.content}>
          { student.get("lastName") }, { student.get("firstName")}
        </div>
      </div>
    );
  }
}

StudentName.defaultProps = {
  student: Map(),
};
