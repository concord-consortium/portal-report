import { createSelector } from "reselect";
import { compareStudentsOrTeachersByName } from "../util/misc";

// Inputs
const getStudents = state => state.getIn(["report", "students"]);
const getTeachers = state => state.getIn(["report", "teachers"]);

// Selectors
export const getSortedStudents = createSelector(
  [ getStudents ],
  (students) => students.toList().sort((student1, student2) => compareStudentsOrTeachersByName(student1, student2))
);

export const getSortedTeachers = createSelector(
  [ getTeachers ],
  (teachers) => teachers.toList().sort((teacher1, teacher2) => compareStudentsOrTeachersByName(teacher1, teacher2))
);
