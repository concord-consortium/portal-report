import { expect } from 'chai'
import { describe, it } from 'mocha'
import { fromJS } from 'immutable'
import getInvestigationTree, { getAnswerTrees, getQuestionTrees, getPageTrees, getSectionTrees, getActivityTrees } from '../../js/selectors/report-tree'

describe('report tree selectors', () => {
  const state = ({ questionVisible = true, hideSectionNames = true }) => fromJS({
    report: {
      students: {
        1: { id: 1, firstName: 'John', lastName: 'Doe' }
      },
      answers: {
        A1: { key: 'A1', studentId: 1, someAnswerProp: 'x' }
      },
      questions: {
        Q1: { key: 'Q1', answers: [ 'A1' ], visible: questionVisible, someQuestionProp: 'x' }
      },
      pages: {
        1: { id: 1, children: [ 'Q1' ], somePageProp: 'x' }
      },
      sections: {
        1: { id: 1, children: [ 1 ], someSectionProp: 'x' }
      },
      activities: {
        1: { id: 1, children: [ 1 ], someActivityProp: 'x' }
      },
      investigations: {
        1: { id: 1, children: [ 1 ], someInvestigationProp: 'x' }
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
      someQuestionProp: 'x',
      answers: [ expectedAnswerTrees.A1 ]
    }
  })
  const expectedPageTrees = ({ questionVisible = true }) => ({
    1: {
      id: 1,
      somePageProp: 'x',
      visible: questionVisible,
      children: [ expectedQuestionTrees({ questionVisible }).Q1 ]
    }
  })
  const expectedSectionTrees = ({ questionVisible = true, nameHidden = true }) => ({
    1: {
      id: 1,
      someSectionProp: 'x',
      visible: questionVisible,
      nameHidden: nameHidden,
      children: [ expectedPageTrees({ questionVisible })[1] ]
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
    }
  })
  const expectedInvestigationTree = ({ questionVisible = true }) => ({
    id: 1,
    someInvestigationProp: 'x',
    children: [ expectedActivityTrees({ questionVisible })[1] ]
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
