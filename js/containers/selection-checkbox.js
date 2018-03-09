import { connect } from 'react-redux'
import { setQuestionSelected } from '../actions'
import SelectionCheckBox from '../components/selection-checkbox'

const mapStateToProps = (state) => {
  return {
    hideControls: state.getIn(['report', 'hideControls'])
  }
}

const SelectionCheckBoxContainer = connect(mapStateToProps, {setQuestionSelected})(SelectionCheckBox)
export default SelectionCheckBoxContainer
