import { initializeDB, getFirestore } from "../js/db";

describe("db helper", () => {
  describe("getFirestore", () => {
    it("should throw an exception if initializeDB is not called first", () => {
      expect(getFirestore).toThrow(Error);
    });
    it("should return the firestore promise when initializeDB is called first", () => {
      // Because we don't have any URL parameters firestore is being initialized
      // with networking disabled
      initializeDB();
      const firestorePromise = getFirestore();
      expect(firestorePromise).toBeTruthy();
    });
  });
});
