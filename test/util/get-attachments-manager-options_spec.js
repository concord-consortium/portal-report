import { getAttachmentsManagerOptions } from "../../js/util/get-attachments-manager-options";

jest.mock("../../js/db", () => ({
  getFirebaseAppName: () => "report-service-dev"
}));

const mockTokenServiceJWT = "tokenServiceJWT";
const mockFetchFirestoreJWTWithDefaultParams = jest.fn(() => ({ token: mockTokenServiceJWT }));
jest.mock("../../js/api", () => ({
  fetchFirestoreJWTWithDefaultParams: (...args) => mockFetchFirestoreJWTWithDefaultParams(...args)
}));

describe("getAttachmentsManagerOptions", () => {
  it("returns correct options", async () => {
    const options = await getAttachmentsManagerOptions();
    expect(mockFetchFirestoreJWTWithDefaultParams).toHaveBeenCalled();
    expect(options).toEqual({
      tokenServiceEnv: "staging",
      tokenServiceFirestoreJWT: mockTokenServiceJWT
    });
  });
});
