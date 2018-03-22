
// Truncate strings eg:
// truncate("this is a sentence", 5) // → "this i…"
export const truncate = (_str, _size) => (_str.length > _size) ? `${_str.substr(0, _size - 1)}…` : _str
