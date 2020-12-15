import React from "react";
import ArrowLeftIcon from "../../../img/svg-icons/arrow-left-icon.svg";

import css from "../../../css/portal-dashboard/student-navigator.less";
import { getFormattedStudentName } from "../../util/student-utils";


interface IProps {
  students: any;
  isAnonymous: boolean;
  currentStudentIndex: number;
  setCurrentStudent: (studentId: string | null) => void;
  currentStudentId: string | null;
  nameFirst: boolean;
  filler?: boolean;
}

export const StudentNavigator: React.FC<IProps> = (props) => {
  const { nameFirst, filler } = props;
  const componentOrder = nameFirst
                        ? [<StudentName key={"student-name"} {...props}/>, <PrevNextButtons key={"prev-next-button"} {...props}/>]
                        : [<PrevNextButtons key={"prev-next-button"} {...props}/>, <StudentName key={"student-name"} {...props}/>];
  return (
    <div className={`${css.studentNavigator} ${filler? css.filler : ""}`}>
      <div className={css.header}>
        {componentOrder.map(component => component)}
      </div>
    </div>
  );
};

const StudentName: React.FC<IProps> = (props) => {
  const { students, isAnonymous, currentStudentIndex, nameFirst } = props;
  const studentSelected = currentStudentIndex >= 0;
  const studentName = studentSelected
                      ? getFormattedStudentName(isAnonymous, students.get(currentStudentIndex))
                      : "Student Response";

  return (
    <div className={`${css.title} ${nameFirst ? css.leftMrgin : ""}`} data-cy='student-name'>
      {!nameFirst && <span className={css.studentLabel}>Student: </span>}{studentName}
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
