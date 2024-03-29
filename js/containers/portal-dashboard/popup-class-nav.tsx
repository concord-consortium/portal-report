import React from "react";
import { Map } from "immutable";
import { connect } from "react-redux";
import { AnonymizeStudents } from "../../components/portal-dashboard/anonymize-students";
import { CustomSelect, SelectItem } from "../../components/portal-dashboard/custom-select";
import { DashboardViewMode, FeedbackLevel, ListViewMode } from "../../util/misc";
import { makeGetStudentFeedbacks } from "../../selectors/activity-feedback-selectors";
import { getfeedbackSortRefreshEnabled } from "../../selectors/dashboard-selectors";
import { CountContainer } from "../../components/portal-dashboard/count-container";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS, SORT_BY_FEEDBACK_NAME,
         SORT_BY_FEEDBACK_PROGRESS, setFeedbackSortRefreshEnabled } from "../../actions/dashboard";
import SortIcon from "../../../img/svg-icons/sort-icon.svg";
import StudentViewIcon from "../../../img/svg-icons/student-view-icon.svg";
import QuestionViewIcon from "../../../img/svg-icons/question-view-icon.svg";
import SpotlightIcon from "../../../img/svg-icons/spotlight-icon.svg";
import RefreshIcon from "../../../img/svg-icons/refresh-icon.svg";
import { TrackEventFunction } from "../../actions";
import { updateActivityFeedback, updateQuestionFeedback } from "../../actions/index";

import css from "../../../css/portal-dashboard/response-details/popup-class-nav.less";
import cssClassNav from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  anonymous: boolean;
  answers: Map<any, any>;
  currentQuestion: Map<any, any> | undefined;
  feedbackLevel: FeedbackLevel;
  feedbackSortByMethod: string;
  feedbackSortRefreshEnabled: boolean;
  activityFeedbacks: Map<any, any>;
  questionFeedbacks: Map<any, any>;
  updateActivityFeedback: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  isSpotlightOn: boolean;
  listViewMode: ListViewMode;
  numFeedbacksNeedingReview: number;
  onShowDialog: (show: boolean) => void;
  questionCount: number;
  setAnonymous: (value: boolean) => void;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  setListViewMode: (value: ListViewMode) => void;
  setStudentFeedbackSort: (value: string) => void;
  setStudentSort: (value: string) => void;
  sortByMethod: string;
  studentCount: number;
  trackEvent: TrackEventFunction;
  viewMode: DashboardViewMode;
  setFeedbackLevel: (feedbackLevel: FeedbackLevel) => void;
  isResearcher: boolean;
}

class PopupClassNav extends React.PureComponent<IProps>{
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { anonymous, feedbackSortByMethod, listViewMode, numFeedbacksNeedingReview, questionCount, studentCount, setAnonymous,
            viewMode, isResearcher } = this.props;
    const numItems = viewMode === "FeedbackReport"
                     ? numFeedbacksNeedingReview
                     : listViewMode === "Question" ? questionCount : studentCount;
    const containerLabel = viewMode === "FeedbackReport"
                           ? "Awaiting feedback"
                           : listViewMode === "Question" ? "Questions" : "Class";
    const containerLabelType = viewMode === "FeedbackReport" || listViewMode === "Question" ? undefined : "students";
    return (
      <div className={`${css.popupClassNav} ${css.column}`}>
        {this.renderViewListOptions()}
        <div className={`${cssClassNav.classNav} ${css.popupClassNavControllers}`} data-cy="class-nav">
          {!isResearcher && <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />}
          <CountContainer numItems={numItems} containerLabel={containerLabel} containerLabelType={containerLabelType} />
          {this.renderSortMenu()}
          {listViewMode === "Student" && viewMode === "ResponseDetails" && this.renderSpotlightToggle()}
          {viewMode === "FeedbackReport" && listViewMode === "Student" && feedbackSortByMethod === SORT_BY_FEEDBACK_PROGRESS &&
           this.renderRefreshButton()}
        </div>
      </div>
    );
  }

  private handleStudentSortSelect = (value: string) => () => {
    const { setStudentSort } = this.props;
    setStudentSort(value);
    this.props.trackEvent("Portal-Dashboard", "StudentSortDropdownChange", {label: value});
  }

  private handleStudentFeedbackSortSelect = (value: string) => () => {
    const { setStudentFeedbackSort } = this.props;
    this.updateFeedbackSortIgnoreFlag();
    this.props.setFeedbackSortRefreshEnabled(false);
    setStudentFeedbackSort(value);
    this.props.trackEvent("Portal-Dashboard", "StudentFeedbackSortDropdownChange", {label: value});
  }

  private renderSortMenu = () => {
    const { viewMode, listViewMode } = this.props;
    if (listViewMode === "Question") {
      return this.renderQuestionFilter();
    }
    if (viewMode === "FeedbackReport") {
      return this.renderFeedbackFilter();
    }
    return this.renderStudentFilter();
  }

  private renderQuestionFilter = () => {
    const { trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          items={[{ value: "", label: "All Questions" }]}
          trackEvent={trackEvent}
          HeaderIcon={SortIcon}
          dataCy={"sort-questions"}
          disableDropdown={true}
          key={"question-sort"}
        />
      </div>
    );
  }

  private renderStudentFilter = () => {
    const items: SelectItem[] = [{ value: SORT_BY_NAME, label: "Student Name",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_NAME) },
                                 { value: SORT_BY_MOST_PROGRESS, label: "Most Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_MOST_PROGRESS) },
                                 { value: SORT_BY_LEAST_PROGRESS, label: "Least Progress",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_LEAST_PROGRESS) }];
    const { sortByMethod, trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          dataCy={"sort-students"}
          HeaderIcon={SortIcon}
          items={items}
          trackEvent={trackEvent}
          value={sortByMethod}
          key={"student-sort"}
        />
      </div>
    );
  }

  private renderFeedbackFilter = () => {
    const items: SelectItem[] = [{ value: SORT_BY_FEEDBACK_NAME, label: "Student Name",
                                   onSelect: this.handleStudentFeedbackSortSelect(SORT_BY_FEEDBACK_NAME) },
                                 { value: SORT_BY_FEEDBACK_PROGRESS, label: "Awaiting Feedback",
                                   onSelect: this.handleStudentFeedbackSortSelect(SORT_BY_FEEDBACK_PROGRESS) }];
    const { feedbackSortByMethod, trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          dataCy={"sort-feedback"}
          HeaderIcon={SortIcon}
          items={items}
          trackEvent={trackEvent}
          value={feedbackSortByMethod}
          key={"feedback-sort"}
        />
      </div>
    );
  }

  private renderViewListOptions() {
    const { feedbackLevel, listViewMode, setListViewMode, viewMode, setFeedbackLevel } = this.props;
    const listByStudentClasses = `${css.toggle} ${css.listByStudents} ${listViewMode==="Student" ? css.selected : ""}`;
    const disableListByQuestions = feedbackLevel === "Activity" && viewMode === "FeedbackReport" ? true : false;
    const listByQuestionsClasses = `${css.toggle} ${css.listByQuestions} ${listViewMode==="Question" ? css.selected : ""}  ${disableListByQuestions ? css.disabled : ""}`;

    const handleClick = (value: ListViewMode) => {
      setListViewMode(value);

      // we also set the feedback level here to avoid have a disabled feedback level option displayed in the feedback page
      if (viewMode === "ResponseDetails" && value === "Question") {
        setFeedbackLevel("Question");
      }
    };

    return (
      <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
        <button className={listByStudentClasses} data-cy="list-by-student-toggle" onClick={() => handleClick("Student")}>
          <StudentViewIcon className={css.optionIcon} />
        </button>
        <button className={listByQuestionsClasses} data-cy="list-by-questions-toggle" onClick={() => handleClick("Question")} disabled={disableListByQuestions}>
          <QuestionViewIcon className={css.optionIcon} />
        </button>
      </div>
    );
  }

  private renderSpotlightToggle() {
    const spotLightContainerClasses = `${css.spotlightContainer} ${this.props.isSpotlightOn ? css.spotlightOn : ""}`;
    return (
      <div className={css.spotlightToggle} onClick={() => this.props.onShowDialog(true)} data-cy="spotlight-toggle">
        <div className={spotLightContainerClasses}>
          <SpotlightIcon className={css.spotlightIcon} />
        </div>
        <span>Spotlight selected</span>
      </div>
    );
  }

  private handleRefeshSelect = () => {
    this.updateFeedbackSortIgnoreFlag();
    this.props.setFeedbackSortRefreshEnabled(false);
  }

  private updateFeedbackSortIgnoreFlag = () => {
    // TODO: this could be more efficient and only update feedbacks if needed
    this.props.questionFeedbacks?.forEach((feedback: any) => {
      const existingFeeback = !!feedback.get("feedback");
      this.props.updateQuestionFeedback(feedback.get("answerId"), {existingFeedbackSinceLastSort: existingFeeback});
    });
    this.props.activityFeedbacks?.forEach((feedback: any) => {
      const existingFeeback = !!feedback.get("feedback");
      let existingRubricFeeback = false;
      feedback.get("rubricFeedback")?.forEach((rf: any) => {
        if (rf.get("id") && rf.get("id") !== "") {
          existingRubricFeeback = true;
        }
      });
      this.props.updateActivityFeedback(feedback.get("activityId"),
        feedback.get("activityIndex"), feedback.get("platformStudentId"), {existingFeedbackSinceLastSort: existingFeeback || existingRubricFeeback});
    });
  }

  private renderRefreshButton = () => {
    const { feedbackSortRefreshEnabled } = this.props;
    return (
      <div
        className={`${css.refreshSortContainer} ${!feedbackSortRefreshEnabled ? css.disabled : ""}`}
        onClick={this.handleRefeshSelect}
      >
        <button className={css.refreshButton}>
          <RefreshIcon className={css.refreshIcon}/>
        </button>
        <span className={css.refreshButtonLabel}>Refresh list</span>
      </div>
    );
  }

}

function mapStateToProps(state: any, ownProps?: any) {
  return (state: any, ownProps: any) => {
    const { answers, currentQuestion, feedbackLevel } = ownProps;
    if (feedbackLevel === "Question") {
      const questionId = currentQuestion.get("id");
      const questionFeedbacks = state.getIn(["feedback", "questionFeedbacks"]);
      const feedbacksGiven = [];
      questionFeedbacks.toArray().map((kv: any) => kv[1]).forEach((feedback: any) => {
        if (feedback.get("questionId") === questionId && feedback.get("feedback")?.trim() !== "") {
          feedbacksGiven.push(feedback);
        }
      });
      const feedbackCount = feedbacksGiven.length || 0;
      const studentAnswers = [];
      answers.toArray().map((kv: any) => kv[1]).forEach((item: any) => {
        item.forEach((ans: any) => {
          if (ans.get("questionId") === questionId) {
            studentAnswers.push(ans);
          }
        });
      });
      const numFeedbacksNeedingReview = studentAnswers.length - feedbackCount;
      return {
        questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
        activityFeedbacks: state.getIn(["feedback", "activityFeedbacks"]),
        numFeedbacksNeedingReview,
        feedbackSortRefreshEnabled: getfeedbackSortRefreshEnabled(state),
      };
    } else {
      const getFeedbacks: any = makeGetStudentFeedbacks();
      const { numFeedbacksNeedingReview } = getFeedbacks(state, ownProps);
      return {
        questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
        activityFeedbacks: state.getIn(["feedback", "activityFeedbacks"]),
        numFeedbacksNeedingReview,
        feedbackSortRefreshEnabled: getfeedbackSortRefreshEnabled(state),
      };
    }
  };
}

const mapDispatchToProps = (dispatch: any, ownProps: any): Partial<IProps> => {
  return {
    setFeedbackSortRefreshEnabled: (value) => dispatch(setFeedbackSortRefreshEnabled(value)),
    updateActivityFeedback: (activityId, activityIndex, platformStudentId, feedback) => dispatch(updateActivityFeedback(activityId, activityIndex, platformStudentId, feedback)),
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PopupClassNav);
