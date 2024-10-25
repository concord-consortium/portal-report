import migrate, {LastVersion} from "../../js/core/rubric-migrations";
import rubric from "../../public/sample-v1-rubric";

describe("the migrating rubric", () => {
  const originalVersion = "1.0.0";
  const migrated = migrate(JSON.parse(JSON.stringify(rubric)));

  it("Should read the example rubric", () => {
    expect(rubric).toHaveProperty("criteria");
  });

  describe("the version number", () => {
    expect(rubric.version).toEqual(originalVersion);
    expect(migrated.version).toEqual(LastVersion);
  });

  describe("criteria.nonApplicableRatings", () => {

    describe("the original rubric json should be sparse", () => {
      const na = rubric.criteria[0].nonApplicableRatings;
      expect(na.length).toBe(1);
    });

    describe("the current rubric json should include values for all ratings", () => {
      const na = migrated.criteriaGroups[0].criteria[0].nonApplicableRatings;
      const expectedLength = rubric.ratings.length;
      expect(na.length).toEqual(expectedLength);
    });
  });

  describe("criteriaGroups", () => {

    describe("the migration should create criteria groups", () => {
      expect(rubric.criteriaGroups).toBe(undefined);
      expect(migrated.criteriaGroups.length).toBe(1);
      expect(migrated.criteriaGroups[0].criteria.length).toBe(rubric.criteria.length);
      expect(migrated.criteria).toBe(undefined);
    });

    describe("it should set the default icon prompt to the empty string", () => {
      migrated.criteriaGroups.forEach(criteriaGroup => {
        criteriaGroup.criteria.forEach(criteria => {
          expect(criteria.iconPhrase).toBe("");
        });
      });
    });

    describe("it should set the default tag summary display to none", () => {
      expect(migrated.tagSummaryDisplay).toBe("none");
    });
  });
});
