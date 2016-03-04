import { connect } from 'react-redux'
import { setQuestionSelected } from '../actions'
import Question from '../components/question'

export function isQuestionVisible(questionJSON, state) {
  const filterActive = state.getIn(['visibilityFilter', 'active'])
  const questionVisible = state.getIn(['visibilityFilter', 'visibleQuestions']).has(questionJSON.key)
  return questionVisible || !filterActive
}

const mapStateToProps = (state, ownProps) => {
  const questionSelected = state.getIn(['visibilityFilter', 'selectedQuestions']).has(ownProps.questionJSON.key)
  return {
    selected: questionSelected,
    hidden: !isQuestionVisible(ownProps.questionJSON, state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectChange: (key, selected) => dispatch(setQuestionSelected(key, selected))
  }
}

const QuestionContainer = connect(mapStateToProps, mapDispatchToProps)(Question)
export default QuestionContainer
