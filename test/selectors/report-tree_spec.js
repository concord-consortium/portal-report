import { expect } from 'chai'
import { describe, it } from 'mocha'
import { fromJS } from 'immutable'
import getInvestigationTree, { getAnswerTrees, getQuestionTrees, getPageTrees, getSectionTrees, getActivityTrees } from '../../js/selectors/report-tree'
import { FULL_REPORT, DASHBOARD } from '../../js/reducers'

describe('report tree selectors', () => {
  const state = ({ questionVisible = true, hideSectionNames = true }) => fromJS({
    // Note that `questionVisible` parameter uses just one of the many ways to make question visible or not.
    // `getQuestionTrees` specs below test all these ways. This is used for tests that deal with the whole state.
    view: {
      type: 'fullReport'
    },
    report: {
      students: {
        1: { id: 1, firstName: 'John', lastName: 'Doe' }
      },
      answers: {
        A1: { key: 'A1', studentId: 1, someAnswerProp: 'x' }
      },
      questions: {
        Q1: { key: 'Q1', answers: [ 'A1' ], hiddenByUser: !questionVisible, someQuestionProp: 'x' },
        Q2: { key: 'Q2', answers: [ ], hiddenByUser: false, someQuestionProp: 'y' }
      },
      pages: {
        1: { id: 1, children: [ 'Q1' ], somePageProp: 'x' },
        2: { id: 2, children: [ 'Q2' ], somePageProp: 'y' }
      },
      sections: {
        1: { id: 1, children: [ 1 ], someSectionProp: 'x' },
        2: { id: 2, children: [ 2 ], someSectionProp: 'y' }
      },
      activities: {
        1: { id: 1, children: [ 1 ], someActivityProp: 'x' },
        2: { id: 2, children: [ 2 ], someActivityProp: 'y' }
      },
      investigations: {
        1: { id: 1, children: [ 1, 2 ], someInvestigationProp: 'x' }
      },
      // additional props that get merged into tree:
      hideSectionNames: hideSectionNames
    }
  })

  const expectedAnswerTrees = {
    A1: {
      key: 'A1',
      someAnswerProp: 'x',
      studentId: 1,
      student: { id: 1, firstName: 'John', lastName: 'Doe' },
    }
  }
  const expectedQuestionTrees = ({ questionVisible = true }) => ({
    Q1: {
      key: 'Q1',
      visible: questionVisible,
      hiddenByUser: !questionVisible,
      someQuestionProp: 'x',
      answers: [ expectedAnswerTrees.A1 ]
    },
    Q2: {
      key: 'Q2',
      visible: true,
      hiddenByUser: false,
      someQuestionProp: 'y',
      answers: [ ]
    }
  })
  const expectedPageTrees = ({ questionVisible = true }) => ({
    1: {
      id: 1,
      somePageProp: 'x',
      visible: questionVisible,
      children: [ expectedQuestionTrees({ questionVisible }).Q1 ]
    },
    2: {
      id: 2,
      somePageProp: 'y',
      visible: true,
      children: [ expectedQuestionTrees({}).Q2 ]
    }
  })
  const expectedSectionTrees = ({ questionVisible = true, nameHidden = true }) => ({
    1: {
      id: 1,
      someSectionProp: 'x',
      visible: questionVisible,
      nameHidden: nameHidden,
      children: [ expectedPageTrees({ questionVisible })[1] ]
    },
    2: {
      id: 2,
      someSectionProp: 'y',
      visible: true,
      nameHidden: nameHidden,
      children: [ expectedPageTrees({})[2] ]
    }
  })
  const expectedActivityTrees = ({ questionVisible = true }) => ({
    1: {
      id: 1,
      someActivityProp: 'x',
      visible: questionVisible,
      children: [ expectedSectionTrees({ questionVisible })[1] ],
      pages: [ expectedPageTrees({ questionVisible })[1] ],
      questions: [ expectedQuestionTrees({ questionVisible }).Q1 ]
    },
    2: {
      id: 2,
      someActivityProp: 'y',
      visible: true,
      children: [ expectedSectionTrees({})[2] ],
      pages: [ expectedPageTrees({})[2] ],
      questions: [ expectedQuestionTrees({}).Q2 ]
    }
  })
  const expectedInvestigationTree = ({ questionVisible = true }) => ({
    id: 1,
    someInvestigationProp: 'x',
    children: [
      expectedActivityTrees({ questionVisible })[1],
      expectedActivityTrees({})[2]
    ]
  })

  describe('getAnswerTrees', () => {
    it('should return answers with students ids mapped to students', () => {
      expect(getAnswerTrees(state({})).toJS()).to.eql(expectedAnswerTrees)
    })
  })

  describe('getQuestionTrees', () => {
    it('should return questions with answers keys mapped to answers', () => {
      expect(getQuestionTrees(state({})).toJS()).to.eql(expectedQuestionTrees({}))
    })

    describe('when there are some questions hidden by user', () => {
      describe('and full report view is used', () => {
        it('should set visibility based on "hiddenByUser" property', () => {
          const questions = fromJS({
            1: { answers: [], hiddenByUser: false },
            2: { answers: [], hiddenByUser: true }
          })
          const answers = fromJS({})
          const showFeaturedQuestionsOnly = false
          const result = getQuestionTrees.resultFunc(questions, answers, FULL_REPORT, showFeaturedQuestionsOnly).toJS()
          expect(result[1].visible).to.eql(true)
          expect(result[2].visible).to.eql(false)
        })
      })
      describe('and dashboard view is used', () => {
        it('should ignore "hiddenByUser" property', () => {
          const questions = fromJS({
            1: { answers: [], hiddenByUser: false },
            2: { answers: [], hiddenByUser: true }
          })
          const answers = fromJS({})
          const showFeaturedQuestionsOnly = false
          const result = getQuestionTrees.resultFunc(questions, answers, DASHBOARD, showFeaturedQuestionsOnly).toJS()
          expect(result[1].visible).to.eql(true)
          expect(result[2].visible).to.eql(true)
        })
      })
    })

    describe('when "showFeaturedQuestionsOnly" filter is enabled', () => {
      describe('and the full report is used', () => {
        it('should ignore "showInFeaturedQuestionReport" property', () => {
          const questions = fromJS({
            1: { answers: [], showInFeaturedQuestionReport: true },
            2: { answers: [], showInFeaturedQuestionReport: false }
          })
          const answers = fromJS({})
          const showFeaturedQuestionsOnly = true
          const result = getQuestionTrees.resultFunc(questions, answers, FULL_REPORT, showFeaturedQuestionsOnly).toJS()
          expect(result[1].visible).to.eql(true)
          expect(result[2].visible).to.eql(true)
        })
      })

      describe('and dashboard view is used', () => {
        it('should set visibility based on "showInFeaturedQuestionReport" property', () => {
          const questions = fromJS({
            1: { answers: [], showInFeaturedQuestionReport: true },
            2: { answers: [], showInFeaturedQuestionReport: false }
          })
          const answers = fromJS({})
          const showFeaturedQuestionsOnly = true
          const result = getQuestionTrees.resultFunc(questions, answers, DASHBOARD, showFeaturedQuestionsOnly).toJS()
          expect(result[1].visible).to.eql(true)
          expect(result[2].visible).to.eql(false)
        })
      })
    })
  })

  describe('getPageTrees', () => {
    it('should return pages with question keys mapped to questions', () => {
      expect(getPageTrees(state({})).toJS()).to.eql(expectedPageTrees({}))
    })
    it('should set visible property based on the children visibility', () => {
      expect(getPageTrees(state({ questionVisible: false })).toJS()).to.eql(expectedPageTrees({ questionVisible: false }))
    })
  })

  describe('getSectionTrees', () => {
    it('should return sections with page ids mapped to pages', () => {
      expect(getSectionTrees(state({})).toJS()).to.eql(expectedSectionTrees({}))
    })
    it('should set visible property based on the children visibility', () => {
      expect(getSectionTrees(state({ questionVisible: false })).toJS()).to.eql(expectedSectionTrees({ questionVisible: false }))
    })
    it('should set nameHidden property based on the hideSectionNames prop', () => {
      expect(getSectionTrees(state({ hideSectionNames: false })).toJS()).to.eql(expectedSectionTrees({ nameHidden: false }))
    })
  })

  describe('getActivityTrees', () => {
    it('should return activities with section ids mapped to sections', () => {
      expect(getActivityTrees(state({})).toJS()).to.eql(expectedActivityTrees({}))
    })
    it('should set visible property based on the children visibility', () => {
      expect(getActivityTrees(state({ questionVisible: false })).toJS()).to.eql(expectedActivityTrees({ questionVisible: false }))
    })
  })

  describe('getInvestigationTrees', () => {
    it('should return investigation (only one!) with activity ids mapped to activities', () => {
      expect(getInvestigationTree(state({})).toJS()).to.eql(expectedInvestigationTree({}))
    })
  })
})
