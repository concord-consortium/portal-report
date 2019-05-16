import queryString from "query-string";

const config = (param: string) => {
  const value = queryString.parse(window.location.search)[param];
  if (value === "false") {
    return false;
  }
  return value;
};

export default config;
