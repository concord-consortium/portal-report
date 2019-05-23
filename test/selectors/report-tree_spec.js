import { fromJS } from "immutable";
import getSequenceTree, { getAnswerTrees, getQuestionTrees, getPageTrees, getSectionTrees, getActivityTrees } from "../../js/selectors/report-tree";
import { FULL_REPORT, DASHBOARD } from "../../js/reducers";

describe("report tree selectors", () => {
  const state = ({ questionVisible = true, hideSectionNames = true }) => fromJS({
    // Note that `questionVisible` parameter uses just one of the many ways to make question visible or not.
    // `getQuestionTrees` specs below test all these ways. This is used for tests that deal with the whole state.
    view: {
      type: "fullReport"
    },
    report: {
      students: {
        1: { id: 1, firstName: "John", lastName: "Doe" }
      },
      answers: {
        A1: { key: "A1", studentId: 1, someAnswerProp: "x" }
      },
      questions: {
        "open_response-1": { key: "open_response-1", hiddenByUser: !questionVisible, someQuestionProp: "x" },
        "image_question-2": { key: "image_question-2", hiddenByUser: false, someQuestionProp: "y" }
      },
      pages: {
        1: { id: 1, children: [  "open_response-1" ], somePageProp: "x" },
        2: { id: 2, children: [ "image_question-2" ], somePageProp: "y" }
      },
      sections: {
        1: { id: 1, children: [ 1 ], someSectionProp: "x" },
        2: { id: 2, children: [ 2 ], someSectionProp: "y" }
      },
      activities: {
        1: { id: 1, children: [ 1 ], someActivityProp: "x" },
        2: { id: 2, children: [ 2 ], someActivityProp: "y" }
      },
      sequences: {
        1: { id: 1, children: [ 1, 2 ], someSequenceProp: "x" }
      },
      // additional props that get merged into tree:
      hideSectionNames: hideSectionNames
    }
  });

  const expectedAnswerTrees = {
    A1: {
      key: "A1",
      someAnswerProp: "x",
      studentId: 1,
      student: { id: 1, firstName: "John", lastName: "Doe" },
    }
  };
  const expectedQuestionTrees = ({ questionVisible = true }) => ({
    "open_response-1": {
      key: "open_response-1",
      visible: questionVisible,
      hiddenByUser: !questionVisible,
      someQuestionProp: "x",
      answers: [ ]
    },
    "image_question-2": {
      key: "image_question-2",
      visible: true,
      hiddenByUser: false,
      someQuestionProp: "y",
      answers: [ ]
    }
  });
  const expectedPageTrees = ({ questionVisible = true }) => ({
    1: {
      id: 1,
      somePageProp: "x",
      visible: questionVisible,
      children: [ expectedQuestionTrees({ questionVisible })["open_response-1"] ]
    },
    2: {
      id: 2,
      somePageProp: "y",
      visible: true,
      children: [ expectedQuestionTrees({})["image_question-2"] ]
    }
  });
  const expectedSectionTrees = ({ questionVisible = true, nameHidden = true }) => ({
    1: {
      id: 1,
      someSectionProp: "x",
      visible: questionVisible,
      nameHidden: nameHidden,
      children: [ expectedPageTrees({ questionVisible })[1] ]
    },
    2: {
      id: 2,
      someSectionProp: "y",
      visible: true,
      nameHidden: nameHidden,
      children: [ expectedPageTrees({})[2] ]
    }
  });
  const expectedActivityTrees = ({ questionVisible = true }) => ({
    1: {
      id: 1,
      someActivityProp: "x",
      visible: questionVisible,
      children: [ expectedSectionTrees({ questionVisible })[1] ],
      pages: [ expectedPageTrees({ questionVisible })[1] ],
      questions: [ expectedQuestionTrees({ questionVisible })["open_response-1"] ]
    },
    2: {
      id: 2,
      someActivityProp: "y",
      visible: true,
      children: [ expectedSectionTrees({})[2] ],
      pages: [ expectedPageTrees({})[2] ],
      questions: [ expectedQuestionTrees({})["image_question-2"] ]
    }
  });
  const expectedSequenceTree = ({ questionVisible = true }) => ({
    id: 1,
    someSequenceProp: "x",
    children: [
      expectedActivityTrees({ questionVisible })[1],
      expectedActivityTrees({})[2]
    ]
  });

  describe("getAnswerTrees", () => {
    it("should return answers with students ids mapped to students", () => {
      expect(getAnswerTrees(state({})).toJS()).toEqual(expectedAnswerTrees);
    });
  });

  describe("getQuestionTrees", () => {
    it("should return questions with answers keys mapped to answers", () => {
      expect(getQuestionTrees(state({})).toJS()).toEqual(expectedQuestionTrees({}));
    });

    describe("when there are some questions hidden by user", () => {
      describe("and full report view is used", () => {
        it('should set visibility based on "hiddenByUser" property', () => {
          const questions = fromJS({
            1: { hiddenByUser: false },
            2: { hiddenByUser: true }
          });
          const activities = fromJS({});
          const sections = fromJS({});
          const pages = fromJS({});
          const showFeaturedQuestionsOnly = false;
          const result = getQuestionTrees.resultFunc(activities, sections, pages, questions, FULL_REPORT, showFeaturedQuestionsOnly).toJS();
          expect(result[1].visible).toBe(true);
          expect(result[2].visible).toBe(false);
        });
      });
      describe("and dashboard view is used", () => {
        it('should ignore "hiddenByUser" property', () => {
          const questions = fromJS({
            1: { hiddenByUser: false },
            2: { hiddenByUser: true }
          });
          const activities = fromJS({});
          const sections = fromJS({});
          const pages = fromJS({});
          const showFeaturedQuestionsOnly = false;
          const result = getQuestionTrees.resultFunc(activities, sections, pages, questions, DASHBOARD, showFeaturedQuestionsOnly).toJS();
          expect(result[1].visible).toBe(true);
          expect(result[2].visible).toBe(true);
        });
      });
    });

    describe('when "showFeaturedQuestionsOnly" filter is enabled', () => {
      describe("and the full report is used", () => {
        it('should ignore "showInFeaturedQuestionReport" property', () => {
          const questions = fromJS({
            1: { showInFeaturedQuestionReport: true },
            2: { showInFeaturedQuestionReport: false }
          });
          const activities = fromJS({});
          const sections = fromJS({});
          const pages = fromJS({});
          const showFeaturedQuestionsOnly = true;
          const result = getQuestionTrees.resultFunc(activities, sections, pages, questions, FULL_REPORT, showFeaturedQuestionsOnly).toJS();
          expect(result[1].visible).toBe(true);
          expect(result[2].visible).toBe(true);
        });
      });

      describe("and dashboard view is used", () => {
        it('should set visibility based on "showInFeaturedQuestionReport" property', () => {
          const questions = fromJS({
            1: { showInFeaturedQuestionReport: true },
            2: { showInFeaturedQuestionReport: false }
          });
          const activities = fromJS({});
          const sections = fromJS({});
          const pages = fromJS({});
          const showFeaturedQuestionsOnly = true;
          const result = getQuestionTrees.resultFunc(activities, sections, pages, questions, DASHBOARD, showFeaturedQuestionsOnly).toJS();
          expect(result[1].visible).toBe(true);
          expect(result[2].visible).toBe(false);
        });
      });
    });
  });

  describe("getPageTrees", () => {
    it("should return pages with question keys mapped to questions", () => {
      expect(getPageTrees(state({})).toJS()).toEqual(expectedPageTrees({}));
    });
    it("should set visible property based on the children visibility", () => {
      expect(getPageTrees(state({ questionVisible: false })).toJS()).toEqual(expectedPageTrees({ questionVisible: false }));
    });
  });

  describe("getSectionTrees", () => {
    it("should return sections with page ids mapped to pages", () => {
      expect(getSectionTrees(state({})).toJS()).toEqual(expectedSectionTrees({}));
    });
    it("should set visible property based on the children visibility", () => {
      expect(getSectionTrees(state({ questionVisible: false })).toJS()).toEqual(expectedSectionTrees({ questionVisible: false }));
    });
    it("should set nameHidden property based on the hideSectionNames prop", () => {
      expect(getSectionTrees(state({ hideSectionNames: false })).toJS()).toEqual(expectedSectionTrees({ nameHidden: false }));
    });
  });

  describe("getActivityTrees", () => {
    it("should return activities with section ids mapped to sections", () => {
      expect(getActivityTrees(state({})).toJS()).toEqual(expectedActivityTrees({}));
    });
    it("should set visible property based on the children visibility", () => {
      expect(getActivityTrees(state({ questionVisible: false })).toJS()).toEqual(expectedActivityTrees({ questionVisible: false }));
    });
  });

  describe("getSequenceTrees", () => {
    it("should return sequence (only one!) with activity ids mapped to activities", () => {
      expect(getSequenceTree(state({})).toJS()).toEqual(expectedSequenceTree({}));
    });
  });
});
