import { preprocessResourceJSON } from "../../js/core/transform-json-response";

describe("preprocessResourceJSON helper", () => {
  const activityJSON = {
    id: 1,
    type: "activity",
    name: "Test activity",
    url: "http://example.com/activities/1",
    children: [
      {
        id: 1,
        type: "section",
        children: [
          {
            id: 1,
            type: "page",
            url: "http://example.com/pages/1",
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

  // Note the incoming data would be use preview_url, but that gets
  // camelized before being sent to preprocessResourceJSON
  const activityJSONWithPreviewUrls = {
    id: 1,
    type: "activity",
    name: "Test activity",
    url: "http://example.com/activities/1",
    previewUrl: "http://example.com/preview/activities/1",
    children: [
      {
        id: 1,
        type: "section",
        children: [
          {
            id: 1,
            type: "page",
            url: "http://example.com/pages/1",
            previewUrl: "http://example.com/preview/pages/1",
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
      //                 activity     section        page    question
      expect(resource.children[0].children[0].children[0].children[0].type).toBe("multiple_choice");
      expect(resource.children[0].children[0].children[0].children[0].scored).toBe(true);
    });
  });

  describe("when there is no previewUrl on a page", () => {
    it("should add one", () => {
      const resource = preprocessResourceJSON(activityJSON);
      //                 activity     section        page
      expect(resource.children[0].children[0].children[0].previewUrl).toBe("http://example.com/pages/1");
    });

    it("should set the questionUrl to match the page url", () => {
      const resource = preprocessResourceJSON(activityJSON);
      //                 activity     section        page    question
      expect(resource.children[0].children[0].children[0].children[0].questionUrl).toBe("http://example.com/pages/1");
    });

  });

  describe("when there is a previewUrl on a page", () => {
    it("shouldn't be modified", () => {
      const resource = preprocessResourceJSON(activityJSONWithPreviewUrls);
      //                 activity     section        page
      expect(resource.children[0].children[0].children[0].previewUrl).toBe("http://example.com/preview/pages/1");
    });

    it("should set the questionUrl to match the page previewUrl", () => {
      const resource = preprocessResourceJSON(activityJSONWithPreviewUrls);
      //                 activity     section        page    question
      expect(resource.children[0].children[0].children[0].children[0].questionUrl).toBe("http://example.com/preview/pages/1");
    });

  });


  describe("when there is no previewUrl on a activity", () => {
    it("should add one", () => {
      const resource = preprocessResourceJSON(activityJSON);
      //                 activity
      expect(resource.children[0].previewUrl).toBe("http://example.com/activities/1");
    });
  });

  describe("when there is a previewUrl on a activity", () => {
    it("shouldn't be modified", () => {
      const resource = preprocessResourceJSON(activityJSONWithPreviewUrls);
      //                 activity
      expect(resource.children[0].previewUrl).toBe("http://example.com/preview/activities/1");
    });
  });

});
