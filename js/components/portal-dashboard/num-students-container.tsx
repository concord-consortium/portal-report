import React from "react";

import css from "../../../css/portal-dashboard/num-students.less";

  interface IProps {
    studentCount: number;
  }

export class NumberOfStudentsContainer extends React.PureComponent<IProps> {
    render() {
      return (
        <div className={css.numStudentsContainer} data-test="num-student-container">
          <span className={css.containerLabel}>Class: </span>
          <span data-test="student-number">{this.props.studentCount}</span>
          <span> students</span>
        </div>
      );
    }
  }