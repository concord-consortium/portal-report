import fetch from "isomorphic-fetch";
import fakeOfferingData from "./data/offering-data.json";
import queryString from "query-string";

const urlParam = (name) => {
  return queryString.parse(window.location.search)[name];
};

const getAuthHeader = () => `Bearer ${urlParam("token")}`;

export function fetchOfferingData() {
  const offeringUrl = urlParam("offering");
  const authHeader = getAuthHeader();
  if (offeringUrl) {
    return fetch(offeringUrl, {headers: {"Authorization": authHeader}})
      .then(checkStatus)
      .then(response => response.json());
  } else {
    // Use fake data if REPORT_URL is not available.
    return new Promise(resolve => setTimeout(() => resolve(fakeOfferingData), 500));
  }
}

export function updateReportSettings(data) {
  // TODO using Firebase
}

// The api-middleware calls this function when we need to load rubric in from a rubricUrl.
const rubricUrlCache = {};

export function fetchRubric(rubricUrl) {
  return new Promise((resolve, reject) => {
    if (!rubricUrlCache[rubricUrl]) {
      fetch(rubricUrl)
        .then(checkStatus)
        .then(response => response.json())
        .then(newRubric => {
          rubricUrlCache[rubricUrl] = newRubric;
          resolve({ url: rubricUrl, rubric: newRubric });
        })
        .catch(e => {
          // tslint:disable-next-line:no-console
          console.error(`unable to load rubric at: ${rubricUrl}`);
          reject(e);
        });
    } else {
      // Cache available, resolve promise immediately and return cached value.
      resolve({rubricUrl, rubric: rubricUrlCache[rubricUrl]});
    }
  });
}

export class APIError {
  constructor(statusText, response) {
    this.message = statusText;
    this.response = response;
  }
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new APIError(response.statusText, response);
  }
}
