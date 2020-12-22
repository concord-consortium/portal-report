import nock from "nock";
import { fetchOfferingData, getPortalFirebaseJWTUrl, fetchFirestoreJWT,
  initializeAuthorization, getAuthHeader } from "../js/api";
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
      describe("when no resourceLinkId is passed", () => {
        it("should return the portal firebase jwt url without a resource_link_id", () => {
          const classHash = "1234";
          const firebaseApp = "test_app";
          const resourceLinkId = null;
          const url = getPortalFirebaseJWTUrl(classHash, resourceLinkId, firebaseApp);
          expect(url).toEqual(`https://portal.com/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`);
        });
      });
      describe("when a resourceLinkId is passed", () => {
        it("should return the portal firebase jwt url with a resource_link_id", () => {
          const classHash = "1234";
          const firebaseApp = "test_app";
          const resourceLinkId = "abcde";
          const url = getPortalFirebaseJWTUrl(classHash, resourceLinkId, firebaseApp);
          expect(url).toEqual(`https://portal.com/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}&resource_link_id=${resourceLinkId}`);
        });
      });
    });
  });

  describe("fetchFirestoreJWT", () => {
    const classHash = "1234";
    const firebaseApp = "test_app";
    const okResponse = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" };

    beforeEach(() => {
      nock("https://portal.com/")
        .get(`/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`)
        .reply(200, okResponse);
    });

    describe("when offering URL param is present", () => {
      beforeEach(() => {
        window.history.replaceState({}, "Test", "/?token=abc&offering=https://portal.com/offerings/123");
      });
      it("should fetch the firestore jwt", async () => {
        const resourceLinkId = null;
        const resp = await fetchFirestoreJWT(classHash, resourceLinkId, firebaseApp);
        expect(resp).toEqual(okResponse);
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
            set: (value) => {throw new Error("must use window.location.assign instead of window.location.href=") }
          }
        }
      )
    });

    beforeEach(() => {
      window.location.assign.mockReset()
    });

    afterAll(() => {
      // restore `window.location` to the `jsdom` `Location` object
      window.location = oldWindowLocation
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
            client_id: "token-service-example-app",
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
    })
  });
});
