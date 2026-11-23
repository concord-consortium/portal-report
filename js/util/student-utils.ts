import { Map } from "immutable";

export const LEARNER_MODE_ABBREVIATION = "LM";
export const LEARNER_MODE_MARKER = ` (${LEARNER_MODE_ABBREVIATION})`;
export const LEARNER_MODE_TOOLTIP = "Learner Mode user";

// A teacher's learner mode account (a "teacher preview student") shows up in the class like a real student.
// Its name gets a marker so the teacher can tell it apart.
export const addLearnerModeMarker = (name: string, isTeacherPreviewStudent?: boolean) =>
  isTeacherPreviewStudent ? `${name}${LEARNER_MODE_MARKER}` : name;

export const getFormattedStudentName = (isAnonymous: boolean, student: Map<any, any>) => {
  return (
    isAnonymous
      // `name` already has the marker (see `setAnonymous` in the report reducer).
      ? student.get("name")
      : addLearnerModeMarker(`${student.get("lastName")}, ${student.get("firstName")}`,
          student.get("isTeacherPreviewStudent"))
  );
};
