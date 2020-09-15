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
  setCurrentStudent: (studentIndex: number) => void;
  currentStudentIndex: number;
}

export class StudentResponse extends React.PureComponent<IProps> {
  render() {
    const { currentQuestion, currentStudentIndex, students, isAnonymous } = this.props;
    const studentSelected = currentStudentIndex >= 0;
    const studentName = studentSelected
                        ? getFormattedStudentName(isAnonymous, students.get(currentStudentIndex))
                        : "Student Response";
    return (
      <div className={css.studentResponse} data-cy="overlay-student-response-area">
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
        <div className={css.responseArea}>
          { studentSelected
            ? <Answer question={currentQuestion} student={students.get(currentStudentIndex)} responsive={true} studentName={studentName}/>
            : <div className={css.selectMessage}>Select a student’s answer in the dashboard to view their response.</div>
          }
        </div>
      </div>
    );
  }

  private changeCurrentStudent = (index: number) => () => {
    const newIndex = Math.min(Math.max(0, index), this.props.students.size - 1);
    if (this.props.currentStudentIndex !== newIndex) {
      this.props.setCurrentStudent(newIndex);
    }
  }
}
