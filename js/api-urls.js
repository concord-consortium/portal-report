const urlParams = (() => {
  const query = window.location.search.substring(1)
  const rawVars = query.split("&")
  let params = {}
  rawVars.forEach((v) => {
    let arr = v.split("=")
    let pair = arr.splice(0, 1);
    pair.push(arr.join("="));
    params[pair[0]] = decodeURIComponent(pair[1])
  })
  return params
})()

// Report URL is provided as GET parameter. Other URLS are automatically generated.
export const REPORT_URL = urlParams['reportUrl']
export const REPORT_FILTER_URL = `${REPORT_URL}/filter`
export const REPORT_ANONYMOUS_URL = `${REPORT_URL}/anonymous`
