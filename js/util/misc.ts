import { Map } from "immutable";

// Truncate strings eg:
// truncate("this is a sentence", 5) // → "this i…"
export const truncate = (str: string, size: number) => (str.length > size) ? `${str.substr(0, size - 1)}…` : str;

export const parseUrl = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  return a;
};

// A comparison function to sort students by last and then first name
export const compareStudentsByName = (student1: Map<string, any>, student2: Map<string, any>) => {
  const lastNameCompare = student1.get("lastName").toLocaleLowerCase().localeCompare(
    student2.get("lastName").toLocaleLowerCase(),
  );
  if (lastNameCompare !== 0) {
    return lastNameCompare;
  } else {
    return student1.get("firstName").localeCompare(student2.get("firstName"));
  }
};
