import queryString from "query-string";

export default function studentReportUrl(studentIds, activityIndex) {
  const url = window.location;
  const params = queryString.parse(url.search);
  params.studentId = studentIds;
  params.activityIndex = activityIndex;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const newSearch = queryString.stringify(params);
  return `${baseUrl}?${newSearch}`;
}
