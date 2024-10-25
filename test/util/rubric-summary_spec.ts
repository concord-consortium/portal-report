import sampleRubric from "../../public/sample-rubric.json";
import sampleRubricNoTags from "../../public/sample-rubric-no-tags.json";
import {getRubricSummary} from "../../js/util/rubric-summary";
import { Rubric } from "../../js/components/portal-dashboard/feedback/rubric-utils";
import { ICriteriaCount } from "../../js/components/portal-dashboard/feedback/rubric-summary-icon";

const criteriaCounts: ICriteriaCount[] = [
  {
    "id": "0_C1",
    "numStudents": 2,
    "ratings": {
      "R1": 1,
      "R2": 0,
      "R3": 1
    }
  },
  {
    "id": "0_C2",
    "numStudents": 2,
    "ratings": {
      "R1": 0,
      "R2": 1,
      "R3": 1
    }
  },
  {
    "id": "1_C1",
    "numStudents": 2,
    "ratings": {
      "R1": 1,
      "R2": 0,
      "R3": 1
    }
  },
  {
    "id": "1_C2",
    "numStudents": 2,
    "ratings": {
      "R1": 1,
      "R2": 1,
      "R3": 0
    }
  }
];

describe("util/rubric-summary", () => {
  describe("getRubricSummary", () => {
    it("should generate the correct rows for the sample rubric", () => {
      const summary = getRubricSummary(sampleRubric as Rubric, criteriaCounts);

      expect(summary.tableRows.length).toBe(4);
      expect(summary.tableRows[0].iconPhrase).toBe("Disciplinary Core Ideas");
      expect(summary.tableRows[1].iconPhrase).toBe("Crosscutting Concepts");
      expect(summary.tableRows[2].iconPhrase).toBe("Disciplinary Core Ideas");
      expect(summary.tableRows[3].iconPhrase).toBe("");

      expect(summary.tagSummaryRows.length).toBe(3);
      expect(summary.tagSummaryRows[0].text).toBe("Disciplinary Core Ideas");
      expect(summary.tagSummaryRows[1].text).toBe("Crosscutting Concepts");
      expect(summary.tagSummaryRows[2].text).toBe("No tag applied");
    });

    it("should generate the correct rows for the sample rubric with no tags", () => {
      const summary = getRubricSummary(sampleRubricNoTags as Rubric, criteriaCounts);

      expect(summary.tableRows.length).toBe(4);
      expect(summary.tableRows[0].iconPhrase).toBe("");
      expect(summary.tableRows[1].iconPhrase).toBe("");
      expect(summary.tableRows[2].iconPhrase).toBe("");
      expect(summary.tableRows[3].iconPhrase).toBe("");

      expect(summary.tagSummaryRows.length).toBe(1);
      expect(summary.tagSummaryRows[0].text).toBe("Class Results");
    });
  });
});