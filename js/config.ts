import queryString from "query-string";

const config = (param: string) => {
  const value = queryString.parse(window.location.search)[param];
  if (value === "false") {
    return false;
  }
  return value;
};

export const configBool = (param: string) => {
  const value = queryString.parse(window.location.search)[param];
  if (value === "false") {
    return false;
  }
  // param without value (e.g. ?param) is returned as null, which is truthy in this context,
  // i.e. ?dashboard launches the dashboard even if no value is assigned.
  return value !== undefined;
};

export default config;
