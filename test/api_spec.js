import nock from "nock";
import { fetchOfferingData, getPortalFirebaseJWTUrl, fetchFirestoreJWT } from "../js/api";

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
        window.history.replaceState({}, "Test", "/?offering=https://portal.com/offerings/123");
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
      it("should return the portal firebase jwt url", async () => {
        const classHash = "1234";
        const firebaseApp = "test_app";
        const url = getPortalFirebaseJWTUrl(classHash, firebaseApp);
        expect(url).toEqual(`https://portal.com/api/v1/jwt/firebase?firebase_app=${firebaseApp}&class_hash=${classHash}`);
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
        window.history.replaceState({}, "Test", "/?offering=https://portal.com/offerings/123");
      });
      it("should fetch the firestore jwt", async () => {
        const resp = await fetchFirestoreJWT(classHash, firebaseApp);
        expect(resp).toEqual(okResponse);
      });
    });
  });
});
