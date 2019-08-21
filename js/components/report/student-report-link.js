import React, { PureComponent } from "react";
import studentReporturl from "../../util/student-report-url";

export default class StudentReportLink extends PureComponent {
  render() {
    const {student, started, activityIndex} = this.props;
    const studentId = student.get("id");
    const name = student.get("name");
    const link = studentReporturl(studentId, activityIndex);

    const linkToWork = (
      <a href={link} target="_blank">
        Open {name}'s report
      </a>
    );

    const noLinkToWork = (
      <span>
        {name} hasn't started yet
      </span>
    );

    if (started) {
      return linkToWork;
    }

    return noLinkToWork;
  }
}
