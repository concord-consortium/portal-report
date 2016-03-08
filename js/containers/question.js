import { connect } from 'react-redux'
import { setQuestionSelected } from '../actions'
import Question from '../components/question'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectChange: (key, selected) => dispatch(setQuestionSelected(key, selected))
  }
}

const QuestionContainer = connect(null, mapDispatchToProps)(Question)
export default QuestionContainer
