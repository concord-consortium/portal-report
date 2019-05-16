
// Truncate strings eg:
// truncate("this is a sentence", 5) // → "this i…"
export const truncate = (str, size) => (str.length > size) ? `${str.substr(0, size - 1)}…` : str;
