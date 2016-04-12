
// return true if no questions are checked visibility filters
export function noSelection(reportState) {
  const selectCount = reportState.get('questions').filter((question,id) => question.get('selected') === true)
  return selectCount.size === 0
}