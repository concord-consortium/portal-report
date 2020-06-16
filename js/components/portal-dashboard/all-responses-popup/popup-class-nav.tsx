import React from "react";
import { AnonymizeStudents } from "../anonymize-students";
import { CustomSelect, SelectItem } from "../custom-select";
import { NumberOfStudentsContainer } from "../num-students-container";
import { SORT_BY_NAME } from "../../../actions/dashboard";
import { SpotlightDialog } from "./spotlight-dialog";

import css from "../../../../css/portal-dashboard/all-responses-popup/popup-class-nav.less";
import cssClassNav from "../../../../css/portal-dashboard/class-nav.less";

interface IProps {
  studentCount: number;
  setAnonymous: (value: boolean) => void;
  setStudentFilter: (value: string) => void;
  trackEvent: (category: string, action: string, label: string) => void;
}
interface IState {
  inQuestionMode: boolean;
  isSpotlightOn: boolean;
  studentSelected: boolean; //temporary state until we can have student selection available
  showDialog: boolean;
}
export class PopupClassNav extends React.PureComponent<IProps, IState>{
  constructor(props: IProps) {
    super(props);
    this.state = {
      inQuestionMode: false,
      isSpotlightOn: false,
      studentSelected: false, //set this to true to see what css looks like when students are selected
      showDialog: false
    };
    this.handleStudentsToggleClick = this.handleStudentsToggleClick.bind(this);
  }

  render() {
    const { studentCount, setAnonymous } = this.props;
    const { showDialog } = this.state;

    return (
      <React.Fragment>
        <div className={`${css.popupClassNav}`}>
          {this.renderViewListOptions()}
          < div className={`${cssClassNav.classNav} ${css.popupClassNavControllers}`} data-cy="class-nav" >
            <AnonymizeStudents setAnonymous={setAnonymous} />
            <NumberOfStudentsContainer studentCount={studentCount} />
            {this.renderStudentFilter()}
            {this.renderSpotlightToggle()}
          </div >
        </div>
        {showDialog && < SpotlightDialog handleCloseDialog={this.closeShowDialog} />}
      </React.Fragment>
    );
  }

  private renderStudentFilter = () => {
    const items: SelectItem[] = [{ action: SORT_BY_NAME, name: "All Students" }];
    const { setStudentFilter, trackEvent } = this.props;
    return (
      <div className={cssClassNav.studentSort}>
        <CustomSelect
          items={items}
          onSelectItem={setStudentFilter}
          trackEvent={trackEvent}
          iconId={"icon-sort"}
          dataCy={"sort-students"}
        />
      </div>
    );
  }
  private renderViewListOptions() {
    let listByStudentClasses: string = css.toggle + " " + css.listByStudents,
      listByQuestionsClasses: string = css.toggle + " " + css.listByQuestions;

    if (!this.state.inQuestionMode) {
      listByStudentClasses += "  " + css.selected;
    } else {
      listByQuestionsClasses += " " + css.selected;
    }

    return (
      <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
        <div className={listByStudentClasses} data-cy="list-by-student-toggle" onClick={this.handleStudentsToggleClick}>
          <svg className={`${css.optionIcon}  `}>
            <use xlinkHref={"#icon-student-view"} />
          </svg>
        </div>
        <div className={listByQuestionsClasses} data-cy="list-by-questions-toggle" onClick={this.handleQuestionsToggleClick}>
          <svg className={`${css.optionIcon}`}>
            <use xlinkHref={"#icon-question-view"} />
          </svg>
        </div>
      </div>
    );
  }

  private renderSpotlightToggle() {
    let spotLightContainerClasses: string = css.spotlightContainer;
    if (this.state.isSpotlightOn && this.state.studentSelected) { spotLightContainerClasses += " " + css.spotlightOn; }
    return (
      <div className={`${css.spotlightToggle}`} onClick={this.handleSpotlightClick} data-cy="spotlight-toggle">
        <div className={spotLightContainerClasses}>
          <svg className={`${css.spotlightIcon}`}>
            <use xlinkHref={"#icon-spotlight"} />
          </svg>
        </div>
        <span>Spotlight selected</span>
      </div>
    );
  }

  private handleStudentsToggleClick = () => {
    this.setState({
      inQuestionMode: false
    });
  }
  private handleQuestionsToggleClick = () => {
    this.setState({
      inQuestionMode: true
    });
  }
  private handleSpotlightClick = () => {
    const wasSpotlightOn = this.state.isSpotlightOn;
    this.setState({
      isSpotlightOn: !wasSpotlightOn
    });
    if (!wasSpotlightOn && !this.state.studentSelected) {
      this.setState({ showDialog: true });
    }
  }

  private closeShowDialog = (show: boolean) => {
    this.setState({ showDialog: show });
    this.setState({
      isSpotlightOn: !this.state.isSpotlightOn
    });
  }
}
