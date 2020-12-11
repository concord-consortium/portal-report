import React from "react";
import { Map } from "immutable";
import Answer from "../../containers/portal-dashboard/answer";
import { StudentNavigator } from "./student-navigator";

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
    const { students, isAnonymous, currentStudentId, setCurrentStudent } = this.props;
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);

    return (
      <div className={css.studentResponse} data-cy="overlay-student-response-area">
        <StudentNavigator students={students}
                          isAnonymous={isAnonymous}
                          currentStudentIndex={currentStudentIndex}
                          setCurrentStudent={setCurrentStudent}
                          currentStudentId={currentStudentId}
        />
        {this.renderResponseArea(currentStudentIndex)}
      </div>
    );
  }

  private renderResponseArea = (currentStudentIndex: number) => {
    const { currentQuestion, students } = this.props;
    const studentSelected = currentStudentIndex >= 0;
    return (
      <div className={css.responseArea}>
        { studentSelected
          ? <Answer question={currentQuestion} student={students.get(currentStudentIndex)} responsive={true}/>
          : <div className={css.selectMessage}>Select a student’s answer in the dashboard to view their response.</div>
        }
      </div>
    );
  }
}
