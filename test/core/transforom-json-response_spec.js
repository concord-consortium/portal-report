import { preprocessResourceJson } from "../../js/core/transform-json-response";

describe("preprocessResourceJson helper", () => {
  const activityJSON = {
    id: 1,
    type: "Activity",
    name: "Test activity",
    children: [
      {
        id: 1,
        type: "Section",
        children: [
          {
            id: 1,
            type: "Page",
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
      const resource = preprocessResourceJson(activityJSON);
      expect(resource.type).toBe("Sequence");
      expect(resource.children[0].type).toBe("Activity");
    });
  });

  describe("when there is a multiple_choice question", () => {
    it("should compute `scored` property", () => {
      const resource = preprocessResourceJson(activityJSON);
      expect(resource.children[0].children[0].children[0].children[0].type).toBe("multiple_choice");
      expect(resource.children[0].children[0].children[0].children[0].scored).toBe(true);
    });
  });
});
