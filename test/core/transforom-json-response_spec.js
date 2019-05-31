import { preprocessResourceJSON } from "../../js/core/transform-json-response";

describe("preprocessResourceJSON helper", () => {
  const activityJSON = {
    id: 1,
    type: "activity",
    name: "Test activity",
    children: [
      {
        id: 1,
        type: "section",
        children: [
          {
            id: 1,
            type: "page",
            children: [
              {
                id: 1,
                type: "multiple_choice",
                choices: [
                  {
                    id: 1,
                    content: "a",
                    correct: true
                  },
                  {
                    id: 2,
                    content: "b",
                    correct: false
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  describe("adds top-level sequence object if it's missing", () => {
    it("should compute `scored` property", () => {
      const resource = preprocessResourceJSON(activityJSON);
      expect(resource.type).toBe("sequence");
      expect(resource.children[0].type).toBe("activity");
    });
  });

  describe("when there is a multiple_choice question", () => {
    it("should compute `scored` property", () => {
      const resource = preprocessResourceJSON(activityJSON);
      expect(resource.children[0].children[0].children[0].children[0].type).toBe("multiple_choice");
      expect(resource.children[0].children[0].children[0].children[0].scored).toBe(true);
    });
  });
});
