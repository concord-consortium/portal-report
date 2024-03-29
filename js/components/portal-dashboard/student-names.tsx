import React from "react";
import { getFormattedStudentName } from "../../util/student-utils";
import { DashboardViewMode, ListViewMode } from "../../util/misc";
import { TrackEventFunction } from "../../actions";

import css from "../../../css/portal-dashboard/student-names.less";

interface IProps {
  students: any; // TODO: add type
  isAnonymous: boolean;
  isCompact: boolean;
  setCurrentStudent: (studentId: string) => void;
  setDashboardViewMode: (mode: DashboardViewMode) => void;
  setListViewMode: (mode: ListViewMode) => void;
  trackEvent: TrackEventFunction;
}

export class StudentNames extends React.PureComponent<IProps> {
  render() {
    const { students, isAnonymous, isCompact } = this.props;
    const compactClass = isCompact ? css.compact : "";

    return (
      <div className={css.studentList} data-cy="student-list">
        { students?.map((student: any, i: number) => {
          const formattedName = getFormattedStudentName(isAnonymous, student);
          return (
            <div className={`${css.studentName} ${compactClass}`} key={`student ${i}`}>
              <div key={`student ${i}`}>
                <div className={css.name}
                     data-cy="student-name"
                     onClick={this.handleOpenQuestionViewForStudent("ResponseDetails", student.get("id"))}>
                      {formattedName}
                </div>
              </div>
            </div>
          );
        }) }
      </div>
    );
  }

  private handleOpenQuestionViewForStudent = (mode: DashboardViewMode, currentStudentId: string) => () => {
    this.props.setDashboardViewMode(mode);
    this.props.setListViewMode("Question");
    this.props.setCurrentStudent(currentStudentId);

    this.props.trackEvent("Portal-Dashboard", "StudentListSetCurrentStudent", {label: currentStudentId});
  }
}
