import queryString from "query-string";

export default function studentReportUrl(studentIds, activityId) {
  const url = window.location;
  const params = queryString.parse(url.search);
  params.studentId = studentIds;
  params.activityId = activityId;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const newSearch = queryString.stringify(params);
  return `${baseUrl}?${newSearch}`;
}
