import { fromJS } from "immutable";
import { RubricHelper } from "../../js/util/rubric-helper";
import rubric from "../../public/sample-v1-rubric";
import feedback from "../../public/sample-rubric-feedback";

describe("the rubric helper class", () => {
  const helper = new RubricHelper(rubric, feedback);

  it("Should read the example rubric", () => {
    expect(rubric).toHaveProperty("criteria");
  });
  it("Should read the example feedback", () => {
    expect(feedback).toHaveProperty("C1");
  });

  describe("scoreFor", () => {
    it("should  return the correct scores", () => {
      const criteria = fromJS(rubric.criteria[0]);
      expect(helper.feedbackScoreForCriteria(criteria)).toBe(3);
    });
  });

  describe("descriptionFor", () => {
    describe("when there is no student description", () => {
      it("should always return the default description", () => {
        const criteria = fromJS(rubric.criteria[0]);
        const expected = "Student makes a claim _supported_ by evidence that indicates the pattern of impact on both ladybugs and aphids when the population of fire ants changes.";

        const defaultDesc = helper.feedbackDescriptionForCriteria(criteria);
        expect(defaultDesc).toBe(expected);

        const studentDesc = helper.feedbackDescriptionForCriteria(criteria, "student");
        expect(studentDesc).toBe(expected);
      });
    });

    describe("when there is a student description", () => {
      it("should return the specific description for students when asked", () => {
        const criteria = fromJS(rubric.criteria[1]);

        const defaultText = "Student provides reasoning that describes predator-prey OR mutually beneficial interactions between fire ants/ladybugs and fire ants/aphids, respectively.";

        const studentText = "Student Specific: R2";

        const defaultDesc = helper.feedbackDescriptionForCriteria(criteria);
        expect(defaultDesc).toBe(defaultText);

        const studentDesc = helper.feedbackDescriptionForCriteria(criteria, "student");
        expect(studentDesc).toBe(studentText);
      });
    });
  });

  describe("allFeedback", () => {
    it("returns an object with all feedback values", () => {
      const data = helper.allFeedback("student");
      const record2 = data[1];
      expect(record2.ratingDescription).toBe("Student Specific: R2");
      expect(record2.score).toBe(2);
      expect(record2.label).toBe("Developing");
      expect(record2.key).toBe("C2");
    });
    describe("with no actual feedback …", () => {
      it("should not return anything", () => {
        const badHelper = new RubricHelper(rubric, {});
        const data = badHelper.allFeedback("student");
        const record2 = data[1];
        expect(record2).toBeNull();
      });
    });
  });

});
