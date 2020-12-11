import React from "react";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/student-navigator.less";
import { getFormattedStudentName } from "../../util/student-utils";


interface IProps {
  students: any;
  isAnonymous: boolean;
  currentStudentIndex: any;
  setCurrentStudent: (studentId: string | null) => void;
  currentStudentId: string | null;
  inResponseDetail?: boolean;
  key?: any;
}

export const StudentNavigator: React.FC<IProps> = (props) => {
  const { inResponseDetail } = props;
  const componentOrder = inResponseDetail ? [<PrevNextButtons key={"prev-next-button"} {...props}/>, <StudentName key={"student-name"} {...props}/>]
                                          : [<StudentName key={"student-name"} {...props}/>, <PrevNextButtons key={"prev-next-button"} {...props}/>];
  return (
    <div className={css.studentArea}>
      <div className={css.responseHeader}>
        {componentOrder.map(component => component)}
      </div>
      {inResponseDetail && <div className={css.studentAreaFiller}></div>}
    </div>
  );
};

const StudentName: React.FC<IProps> = (props) => {
  const { students, isAnonymous, currentStudentIndex, inResponseDetail } = props;
  const studentSelected = currentStudentIndex >= 0;
  const studentName = studentSelected? getFormattedStudentName(isAnonymous, students.get(currentStudentIndex)) : "Student Response";

  return (
    <div className={`${css.title} ${inResponseDetail ? "" : css.overlay}`} data-cy='overlay-student-name'>
      {inResponseDetail && <span className={css.studentLabel}>Student: </span>}{studentName}
    </div>
  );
};

const PrevNextButtons: React.FC<IProps> = (props) => {
  const { students, currentStudentId, currentStudentIndex } = props;
  const studentSelected = currentStudentIndex >= 0;

  const changeCurrentStudent = (index: number) => () => {
    const newIndex = Math.min(Math.max(0, index), props.students.size - 1);
    const currentStudentIndex = students.findIndex((s: any) => s.get("id") === currentStudentId);
    if (currentStudentIndex !== newIndex) {
      const newId = students.get(newIndex).get("id");
      props.setCurrentStudent(newId);
    }
  };

  return (
    <div className={css.nextStudentButtons}>
    <div className={`${css.button} ${(studentSelected && currentStudentIndex > 0) ? "" : css.disabled}`}
      data-cy="previous-student-button" onClick={changeCurrentStudent(currentStudentIndex - 1)}>
      <ArrowLeftIcon className={css.icon} />
    </div>
    <div className={`${css.button} ${(studentSelected && currentStudentIndex < students.size - 1) ? "" : css.disabled}`}
      data-cy="next-student-button" onClick={changeCurrentStudent(currentStudentIndex + 1)}>
      <ArrowLeftIcon className={css.icon} />
    </div>
  </div>
  );
};