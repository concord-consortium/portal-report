import queryString from "query-string";

const config = (param: string) => {
  let value = queryString.parse(window.location.search)[param];
  if (value === "false") {
    value = false;
  }
  return value;
};

export default config;
