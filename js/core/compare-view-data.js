import { answer } from './report-data'

// Simply map keys to answer objects.
export default function compareViewData(reportState) {
  return reportState.get('compareViewAnswers').map(key => answer(reportState, key))
}
