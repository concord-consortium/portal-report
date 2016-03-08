import { connect } from 'react-redux'
import { showSelectedQuestions, showAllQuestions, setAnonymous } from '../actions'
import Report from '../components/report'

const mapStateToProps = (state, ownProps) => {
  return {
    isAnonymous: state.getIn(['students', 'anonymous']),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    showSelectedQuestions: () => dispatch(showSelectedQuestions()),
    showAllQuestions: () => dispatch(showAllQuestions()),
    setAnonymous: (value) => dispatch(setAnonymous(value))
  }
}

const ReportContainer = connect(mapStateToProps, mapDispatchToProps)(Report)
export default ReportContainer
