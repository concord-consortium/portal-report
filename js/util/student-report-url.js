import queryString from 'query-string'

export const studentIdParam = 'studentId'

export default function studentReportUrl (studentIds, activityId) {
  const url = window.location
  const params = queryString.parse(url.search)
  if (params.reportUrl) {
    const reportUrl = decodeURIComponent(params.reportUrl)
    const additions = `activity_id=${activityId}&student_ids[]=${studentIds}`
    params.reportUrl = reportUrl.includes('?') ? `${reportUrl}&${additions}` : `${reportUrl}?${additions}`
  }
  params.studentId = studentIds
  params.activity_id = activityId
  params.reportFor = 'student'
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const newSearch = queryString.stringify(params)
  return `${baseUrl}?${newSearch}`
}
