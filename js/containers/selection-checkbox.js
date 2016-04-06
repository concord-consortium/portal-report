import { connect } from 'react-redux'
import { setQuestionSelected } from '../actions'
import SelectionCheckBox from '../components/selection-checkbox'

const mapDispatchToProps = (dispatch) => {
  return {
    onSelectChange: (key, selected) => {
      dispatch(setQuestionSelected(key, selected))
    }
  }
}

const mapStateToProps = (state) => {
  return  {
    hideControls: state.getIn(['report','hideControls'])
  }
}

const SelectionCheckBoxContainer = connect(mapStateToProps, mapDispatchToProps)(SelectionCheckBox)
export default SelectionCheckBoxContainer
