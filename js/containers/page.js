import { connect } from 'react-redux'
import Page from '../components/page'
import { isQuestionVisible } from '../containers/question'

export function isPageVisible(pageJSON, state) {
  // Page is visible if there is at least one visible question.
  return !!pageJSON.children.find((questionJSON) => {
    return isQuestionVisible(questionJSON, state)
  })
}

const mapStateToProps = (state, ownProps) => {
  return {
    hidden: !isPageVisible(ownProps.pageJSON, state)
  }
}

const PageContainer = connect(mapStateToProps)(Page)
export default PageContainer
