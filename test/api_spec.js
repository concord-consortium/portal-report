import nock from "nock";
import { fetchOfferingData, getPortalFirebaseJWTUrl, fetchFirestoreJWT,
  initializeAuthorization, getAuthHeader, updateReportSettingsInPortal } from "../js/api";
import queryString from "query-string";

describe("api helper", () => {
  afterEach(() => {
    window.history.replaceState({}, "Test", "/");
    nock.cleanAll();
  });

  describe("fetchOfferingData", () => {
    const okResponse = { message: "OK" };

    beforeEach(() => {
      nock("https://portal.com/")
        .get("/offerings/123").reply(200, okResponse);
    });

    describe("when offering URL param is present", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", "/?token=abc&offering=https://portal.com/offerings/123");
      });
      it("should use it to download report data", async () => {
        const resp = await fetchOfferingData();
        expect(resp).toEqual(okResponse);
      });
    });
  });

  describe("getPortalFirebaseJWTUrl", () => {
    describe("when offering URL param is present", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", "/?offering=https://portal.com/offerings/123");
      });
      const classHash = "1234";
      const firebaseApp = "test_app";
      let resourceLinkId = null;
      let targetUserId = null;

      function getUrl() {
        return getPortalFirebaseJWTUrl(classHash, resourceLinkId, targetUserId, firebaseApp);
      }

      const baseResultUrl = `https://portal.com/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`

      describe("when no resourceLinkId is passed or targetUserId is passed", () => {
        beforeAll(() => {
          resourceLinkId = null;
          targetUserId = null;
        });
        it("should return the portal firebase jwt url without a resource_link_id or target_link_id", () => {
          expect(getUrl()).toEqual(baseResultUrl);
        });
      });
      describe("when only resourceLinkId is passed", () => {
        beforeAll(() => {
          resourceLinkId = "abcde";
          targetUserId = null;
        });

        it("should return the portal firebase jwt url with a resource_link_id", () => {
          expect(getUrl()).toEqual(`${baseResultUrl}&resource_link_id=${resourceLinkId}`);
        });
      });
      describe("when only a targetUserId is passed", () => {
        beforeAll(() => {
          resourceLinkId = null;
          targetUserId = "abcde";
        });

        it("should return the portal firebase jwt url with a target_user_id", () => {
          expect(getUrl()).toEqual(`${baseResultUrl}&target_user_id=${targetUserId}`);
        });
      });
      describe("when both a resourceLinkId or targetUserId is passed", () => {
        beforeAll(() => {
          resourceLinkId = "abcde";
          targetUserId = "fghik";
        });

        it("should return the portal firebase jwt url with a resource_link_id and target_user_id", () => {
          expect(getUrl()).toEqual(`${baseResultUrl}&resource_link_id=${resourceLinkId}&target_user_id=${targetUserId}`);
        });
      });
    });
  });

  describe("fetchFirestoreJWT", () => {
    const classHash = "1234";
    const firebaseApp = "test_app";
    const okResponse = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" };

    describe("when offering URL param is present", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", "/?token=abc&offering=https://portal.com/offerings/123");
      });

      describe("when no resourceLinkId or targetUserId is included", () => {
        beforeEach(() => {
          nock("https://portal.com/")
            .get(`/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`)
            .reply(200, okResponse);
        });

        it("should fetch the firestore jwt", async () => {
          const resourceLinkId = null;
          const targetUserId = null;
          const resp = await fetchFirestoreJWT(classHash, resourceLinkId, targetUserId, firebaseApp);
          expect(resp).toEqual(okResponse);
        });

      });
      describe("when a resourceLinkId and targetUserId is included", () => {
        beforeEach(() => {
          nock("https://portal.com/")
            .get(`/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}&resource_link_id=abcde&target_user_id=fghijk`)
            .reply(200, okResponse);
        });

        it("should fetch the firestore jwt", async () => {
          const resourceLinkId = "abcde";
          const targetUserId = "fghijk";
          const resp = await fetchFirestoreJWT(classHash, resourceLinkId, targetUserId, firebaseApp);
          expect(resp).toEqual(okResponse);
        });

      });
    });
  });

  describe("updateReportSettingsInPortal", () => {
    // need a fake offering url param that includes /offerings/
    const fakeOfferingUrl = "https://portal.com/offerings/123";
    const okResponse = "OK";
    const fakeSettings = {something: "important"};

    beforeEach(() => {
    });

    describe("when both offering and token URL params are present", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", `/?token=abc&offering=${fakeOfferingUrl}`);
      });
      it("should put data", async () => {
        const request = nock("https://portal.com/", {
          reqheaders: {
            authorization: "Bearer abc"
          }
        })
          .put(`/reports/123`, fakeSettings)
          .reply(200, okResponse);
        const resp = await updateReportSettingsInPortal(fakeSettings);
        expect(request.isDone()).toBeTruthy();
      });
    });

    describe("when offering param is present and token is not", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", `/?offering=${fakeOfferingUrl}`);
      });
      it("throws an exception", async () => {
        expect.assertions(2);
        try {
          await updateReportSettingsInPortal(fakeSettings);
        } catch( e) {
          expect(e).toBeTruthy();
        }
        expect(nock.isDone()).toBeTruthy();
      });
    });

    describe("when offering param is not present", () => {
      const originalWarn = console.warn
      beforeEach(() => {
        window.history.replaceState({}, "Test", `/`);
        console.warn = jest.fn();
      });
      afterEach(() => {
        console.warn = originalWarn;
      });
      it("resolves without any requests, and prints a warning", async () => {
        await updateReportSettingsInPortal(fakeSettings);
        expect(nock.isDone()).toBeTruthy();
        expect(console.warn).toHaveBeenCalled();
      });
    });

  });

  describe("initializeAuthorization", () => {
    const oldWindowLocation = window.location;

    function getWindowHref() {
      const calls = window.location.assign.mock.calls;
      return calls[calls.length - 1][0];
    }

    beforeAll(() => {
      // This approach is based on this blog post:
      //  https://www.benmvp.com/blog/mocking-window-location-methods-jest-jsdom/
      // I added the href set override to catch any code that might be calling
      // `window.location.href=``
      delete window.location;

      const oldPropertyDescriptors = Object.getOwnPropertyDescriptors(oldWindowLocation);
      window.location = Object.defineProperties(
        {},
        {
          ...oldPropertyDescriptors,
          assign: {
            configurable: true,
            value: jest.fn(),
          },
          href: {
            ...oldPropertyDescriptors.href,
            set: (value) => {throw new Error("must use window.location.assign instead of window.location.href="); }
          }
        }
      );
    });

    beforeEach(() => {
      window.location.assign.mockReset();
    });

    afterAll(() => {
      // restore `window.location` to the `jsdom` `Location` object
      window.location = oldWindowLocation;
    });

    describe("when there is no access_token param", () => {
      describe("and an auth-domain param", () => {
        beforeEach(() => {
          window.history.replaceState({}, "Test", "/?auth-domain=https://portal.concord.org&extraParam=extraValue");
        });

        it("redirects to portal to authenticate", () => {
          initializeAuthorization();
          expect(window.location.assign).toHaveBeenCalledTimes(1);
          const redirectURL = getWindowHref();
          const urlParts = queryString.parseUrl(redirectURL);
          expect(urlParts.url).toEqual("https://portal.concord.org/auth/oauth_authorize");
          expect(urlParts.query).toMatchObject({
            client_id: "portal-report",
            redirect_uri: "https://portal-report.unexisting.url.com/",
            response_type: "token"
          });
        });

        it("saves all query params in session storage under state key", () => {
          initializeAuthorization();
          expect(window.location.assign).toHaveBeenCalledTimes(1);
          const redirectURL = getWindowHref();
          const urlParts = queryString.parseUrl(redirectURL);
          const state = urlParts.query.state;
          const savedParams = sessionStorage.getItem(state);
          expect(savedParams).toEqual("?auth-domain=https://portal.concord.org&extraParam=extraValue");
        });
      });

      describe("and no auth-domain param", () => {
        it("does not redirect", () => {
          initializeAuthorization();
          expect(window.location.assign).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe("when there is an access_token and state param", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", "/#access_token=1234567&state=abcdefg");
      });

      it("saves the accessToken for use in the auth header", () => {
        initializeAuthorization();
        const authHeader = getAuthHeader();
        expect(authHeader).toEqual("Bearer 1234567");
      });

      it("load parameters from session storage, and updates the url", () => {
        sessionStorage.setItem("abcdefg", "?auth-domain=https://portal.concord.org&extraParam=extraValue");
        initializeAuthorization();
        expect(window.location.href).toEqual("https://portal-report.unexisting.url.com/?auth-domain=https://portal.concord.org&extraParam=extraValue");
      });
      it("does not redirect", () => {
        initializeAuthorization();
        expect(window.location.assign).toHaveBeenCalledTimes(0);
      });
    });
  });
});
