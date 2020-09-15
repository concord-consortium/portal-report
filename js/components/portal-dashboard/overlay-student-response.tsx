import React from "react";
import { Map } from "immutable";
import { getFormattedStudentName } from "../../util/student-utils";
import Answer from "../../containers/portal-dashboard/answer";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/overlay-student-response.less";

interface IProps {
  students: any;
  isAnonymous: boolean;
  currentQuestion?: Map<string, any>;
  setCurrentStudent: (studentId: string | null) => void;
  currentStudentId: string | null;
}

export class StudentResponse extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, currentStudentId } = this.props;
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId );
    const studentSelected = currentStudentIndex >= 0;
    const studentName = studentSelected
                        ? getFormattedStudentName(isAnonymous, students.get(currentStudentIndex))
                        : "Student Response";
    return (
      <div className={css.studentResponse} data-cy="overlay-student-response-area">
        {this.renderResponseHeader(currentStudentIndex, studentName)}
        {this.renderResponseArea(currentStudentIndex, studentName)}
      </div>
    );
  }

  private renderResponseHeader = (currentStudentIndex: any, studentName: string) => {
    const { students } = this.props;
    const studentSelected = currentStudentIndex >= 0;
    return (
      <div className={css.responseHeader}>
        <div className={css.title} data-cy='overlay-student-name'>{studentName}</div>
        <div className={css.nextStudentButtons}>
          <div className={`${css.button} ${(studentSelected && currentStudentIndex > 0) ? "" : css.disabled}`}
            data-cy="previous-student-button" onClick={this.changeCurrentStudent(currentStudentIndex - 1)}>
            <ArrowLeftIcon className={css.icon} />
          </div>
          <div className={`${css.button} ${(studentSelected && currentStudentIndex < students.size - 1) ? "" : css.disabled}`}
            data-cy="next-student-button" onClick={this.changeCurrentStudent(currentStudentIndex + 1)}>
            <ArrowLeftIcon className={css.icon} />
          </div>
        </div>
      </div>
    );
  }

  private renderResponseArea = (currentStudentIndex: number, studentName: string) => {
    const { currentQuestion, students } = this.props;
    const studentSelected = currentStudentIndex >= 0;
    return (
      <div className={css.responseArea}>
        { studentSelected
          ? <Answer question={currentQuestion} student={students.get(currentStudentIndex)} responsive={true} studentName={studentName}/>
          : <div className={css.selectMessage}>Select a student’s answer in the dashboard to view their response.</div>
        }
      </div>
    );
  }

  private changeCurrentStudent = (index: number) => () => {
    const { currentStudentId, students } = this.props;
    const newIndex = Math.min(Math.max(0, index), this.props.students.size - 1);
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId );
    if (currentStudentIndex !== newIndex) {
      const newId = students.get(newIndex).get("id");
      this.props.setCurrentStudent(newId);
    }
  }
}
