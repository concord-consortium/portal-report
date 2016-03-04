import { connect } from 'react-redux'
import AnswersTable from '../components/answers-table'

const mapStateToProps = (state, ownProps) => {
  return {
    studentName: state.getIn(['students', 'studentName']).toJS()
  }
}

const AnswersTableContainer = connect(mapStateToProps)(AnswersTable)
export default AnswersTableContainer
