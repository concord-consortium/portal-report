import React, { PureComponent } from "react";
import { Map } from "immutable";
import { getFormattedStudentName } from "../../util/student-utils";
import { StudentNameWithMarker } from "../portal-dashboard/student-name-with-marker";

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
          <StudentNameWithMarker name={getFormattedStudentName(false, student)} student={student} truncate={true} />
        </div>
      </div>
    );
  }
}

StudentName.defaultProps = {
  student: Map(),
};
