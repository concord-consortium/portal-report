import { getAttachmentsManagerOptions, isReportAnonymous } from "../../js/util/get-attachments-manager-options";

jest.mock("../../js/db", () => ({
  getFirebaseAppName: () => "report-service-dev"
}));

const mockTokenServiceJWT = "tokenServiceJWT";
const mockFetchFirestoreJWTWithDefaultParams = jest.fn(() => ({ token: mockTokenServiceJWT }));
jest.mock("../../js/api", () => ({
  fetchFirestoreJWTWithDefaultParams: (...args) => mockFetchFirestoreJWTWithDefaultParams(...args)
}));

describe("getAttachmentsManagerOptions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when report is run in non-anonymous mode", () => {
    it("returns correct options", async () => {
      const options = await getAttachmentsManagerOptions();
      expect(mockFetchFirestoreJWTWithDefaultParams).toHaveBeenCalled();
      expect(options).toEqual({
        tokenServiceEnv: "staging",
        tokenServiceFirestoreJWT: mockTokenServiceJWT
      });
    });
  });

  describe("when report is run in anonymous mode", () => {
    beforeEach(() => {
      window.history.replaceState({}, "Test", "/?runKey=abcde");
    });

    it("returns correct options", async () => {
      expect(isReportAnonymous()).toEqual(true);
      const options = await getAttachmentsManagerOptions();
      expect(mockFetchFirestoreJWTWithDefaultParams).not.toHaveBeenCalled();
      expect(options).toEqual({
        tokenServiceEnv: "staging",
        tokenServiceFirestoreJWT: undefined
      });
    });
  });
});
