import { createSelector } from "reselect";
import { compareStudentsByName } from "../util/misc";

// Inputs
const getStudents = state => state?.report?.students;

// Selectors
export const getSortedStudents = createSelector(
  [ getStudents ],
  (students) => students.toList().sort((student1, student2) => compareStudentsByName(student1, student2))
);
