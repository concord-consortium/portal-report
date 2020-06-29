/* eslint-disable no-console */
import React from "react";
import { getFormattedStudentName } from "../../util/student-utils";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/overlay-student-response.less";

interface IProps {
  students: any;
  isAnonymous: boolean;
}
interface IState {
  currentStudent: any;
}

export class StudentResponse extends React.PureComponent<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentStudent: this.props.students.first()
    };
  }
  render() {
    return (
      <div data-cy="overlay-student-response-area">
        <div className={css.responseHeader}>
          <div className={css.title}>{getFormattedStudentName(this.props.isAnonymous, this.state.currentStudent)}</div>
          <div className={css.nextStudentButtons}>
            <div className={css.button + (this.previousStudent ? "" : " " + css.disabled) }
              data-cy="previous-student-button" onClick={this.toggleStudent(this.previousStudent)}>
              <ArrowLeftIcon className={css.icon} />
            </div>
            <div className={css.button + (this.nextStudent ? "" : " " + css.disabled )}
              data-cy="next-student-button" onClick={this.toggleStudent(this.nextStudent)}>
              <ArrowLeftIcon className={css.icon} />
            </div>
          </div>
        </div>
        <div className={css.responseArea}>
          This is where student's response will go
        </div>
      </div>
    );
  }

  private toggleStudent = (student: any) => () => {
    if (student) {
      this.setState({ currentStudent: student });
    }
    console.log("toggleStudent was clicked: ", student);
  }

  private get previousStudent() {
    const { students } = this.props;
    const studentArr = students.toArray();
    const student = this.state.currentStudent;
    if (!students) return false;
    const idx = studentArr.indexOf(student);
    if (idx > 0) {
      return studentArr[idx - 1];
    }
    return false;
  }

  private get nextStudent() {
    const { students } = this.props;
    const studentArr = students.toArray();
    const student = this.state.currentStudent;
    if (!students) return false;
    const idx = studentArr.indexOf(student);
    if (idx < studentArr.length - 1) {
      return studentArr[idx + 1];
    }
    return false;
  }
}
