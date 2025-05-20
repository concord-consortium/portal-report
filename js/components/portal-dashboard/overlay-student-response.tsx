import React from "react";
import { Map } from "immutable";
import Answer from "../../containers/portal-dashboard/answer";
import { StudentNavigator } from "./student-navigator";
import { getFormattedStudentName } from "../../util/student-utils";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/overlay-student-response.less";

interface IProps {
  students: any;
  isAnonymous: boolean;
  currentQuestion?: Map<string, any>;
  setCurrentStudent: (studentId: string | null) => void;
  currentStudentId: string | null;
  trackEvent: TrackEventFunction;
}

export class StudentResponse extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, currentStudentId, setCurrentStudent } = this.props;
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);

    return (
      <div className={css.studentResponse} data-cy="overlay-student-response-area">
        <StudentNavigator
          students={students}
          isAnonymous={isAnonymous}
          currentStudentIndex={currentStudentIndex}
          setCurrentStudent={setCurrentStudent}
          currentStudentId={currentStudentId}
          nameFirst={true}
        />
        {this.renderResponseArea(currentStudentIndex)}
      </div>
    );
  }

  private renderResponseArea = (currentStudentIndex: number) => {
    const { currentQuestion, students, isAnonymous, trackEvent } = this.props;
    const studentSelected = currentStudentIndex >= 0;
    const studentName = studentSelected
                        ? getFormattedStudentName(isAnonymous, students.get(currentStudentIndex))
                        : "Student Response";
    return (
      <div className={css.responseArea}>
        { studentSelected
          ? <Answer
              question={currentQuestion}
              student={students.get(currentStudentIndex)}
              responsive={true}
              studentName={studentName}
              trackEvent={trackEvent}
              answerOrientation="tall"
              inQuestionDetailsPanel={true}
            />
          : <div className={css.selectMessage}>Select a student’s answer in the dashboard to view their response.</div>
        }
      </div>
    );
  }
}
