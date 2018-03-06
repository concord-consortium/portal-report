import queryString from 'query-string'

export const studentIdParam = 'studentId'

export default function studentReportUrl(student_ids) {
  const url = window.location
  const params = queryString.parse(url.search)
  params[studentIdParam] = student_ids
  params.reportFor = 'student'
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const newSearch = queryString.stringify(params)
  return `${baseUrl}?${newSearch}`
}
