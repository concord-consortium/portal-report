import React, { PureComponent } from "react";
import Button from "../common/button";

import css from "../../../css/dashboard/expand-students.less";

class ExpandStudentsButton extends PureComponent {
  handleClick = () => {
    const { onSetStudentsExpanded, students, anyStudentsExpanded, trackEvent } = this.props;
    onSetStudentsExpanded(students.map(student => student?.id), !anyStudentsExpanded);
    const trackAction = anyStudentsExpanded ? "Closed All Students" : "Opened All Students";
    trackEvent("Dashboard", trackAction);
  }

  render() {
    const { anyStudentsExpanded } = this.props;
    return (
      <Button onClick={this.handleClick} className={css.button}>
        {anyStudentsExpanded ? "Close Students" : "Open Students"}
      </Button>
    );
  }
}

export default class ExpandStudents extends PureComponent {
  render() {
    const { expandedStudents, students, setStudentsExpanded, trackEvent } = this.props;
    const anyStudentsExpanded = expandedStudents.some((isExpanded) => isExpanded);
    return (
      <div className={css.expandStudents}>
        <div className={css.title} />
        <div className={css.buttonCell} data-cy="openCloseStudents">
          <ExpandStudentsButton
            students={students}
            onSetStudentsExpanded={setStudentsExpanded}
            anyStudentsExpanded={anyStudentsExpanded}
            trackEvent={trackEvent} />
        </div>
      </div>
    );
  }
}

ExpandStudents.defaultProps = {
  expandedStudents: Map(),
  students: List(),
};
