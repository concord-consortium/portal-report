import nock from "nock";
import { fetchOfferingData } from "../js/api";

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
});
