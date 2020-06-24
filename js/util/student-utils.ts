export const getFormattedStudentName = (isAnonymous: boolean, student: Map<any, any>) => {
  return (
    isAnonymous
      ? student.get("name")
      : `${student.get("lastName")}, ${student.get("firstName")}`
  );
};
