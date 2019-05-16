import { connect } from "react-redux";
import { setQuestionSelected } from "../../actions/index";
import SelectionCheckBox from "../../components/report/selection-checkbox";

const mapStateToProps = (state) => {
  return {
    hideControls: state.getIn(["report", "hideControls"]),
  };
};

const SelectionCheckBoxContainer = connect(mapStateToProps, {setQuestionSelected})(SelectionCheckBox);
export default SelectionCheckBoxContainer;
