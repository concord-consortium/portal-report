// Truncate strings eg:
// truncate("this is a sentence", 5) // → "this i…"
export const truncate = (str: string, size: number) => (str.length > size) ? `${str.substr(0, size - 1)}…` : str;

export const parseUrl = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  return a;
};
