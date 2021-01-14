import React from "react";
import { connect } from "react-redux";
import { AnonymizeStudents } from "../../components/portal-dashboard/anonymize-students";
import { CustomSelect, SelectItem } from "../../components/portal-dashboard/custom-select";
import { FeedbackLevel, ListViewMode } from "../../util/misc";
import { makeGetStudentFeedbacks } from "../../selectors/activity-feedback-selectors";
import { CountContainer } from "../../components/portal-dashboard/count-container";
import { SORT_BY_NAME, SORT_BY_MOST_PROGRESS, SORT_BY_LEAST_PROGRESS, SORT_BY_FEEDBACK } from "../../actions/dashboard";
import SortIcon from "../../../img/svg-icons/sort-icon.svg";
import StudentViewIcon from "../../../img/svg-icons/student-view-icon.svg";
import QuestionViewIcon from "../../../img/svg-icons/question-view-icon.svg";
import SpotlightIcon from "../../../img/svg-icons/spotlight-icon.svg";

import css from "../../../css/portal-dashboard/response-details/popup-class-nav.less";
import cssClassNav from "../../../css/portal-dashboard/class-nav.less";

interface IProps {
  activity: Map<any, any>;
  anonymous: boolean;
  answers: Map<any, any>;
  currentQuestion: Map<any, any> | undefined;
  feedbackLevel: FeedbackLevel;
  isSpotlightOn: boolean;
  listViewMode: ListViewMode;
  numFeedbacksNeedingReview: number;
  onShowDialog: (show: boolean) => void;
  questionCount: number;
  setAnonymous: (value: boolean) => void;
  setListViewMode: (value: ListViewMode) => void;
  setStudentSort: (value: string) => void;
  sortByMethod: string;
  studentCount: number;
  trackEvent: (category: string, action: string, label: string) => void;
  viewMode: string;
}

class PopupClassNav extends React.PureComponent<IProps>{
  constructor(props: IProps) {
    super(props);
  }

  render() {

    const { activity, anonymous, listViewMode, numFeedbacksNeedingReview, questionCount, studentCount, setAnonymous, viewMode } = this.props;
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
          <AnonymizeStudents anonymous={anonymous} setAnonymous={setAnonymous} />
          <CountContainer
            numItems={numItems}
            containerLabel={containerLabel}
            containerLabelType={containerLabelType}
          />
          {
            viewMode === "FeedbackReport"
              ? this.renderFeedbackFilter()
              : listViewMode === "Question"
                ? this.renderQuestionFilter() : this.renderStudentFilter()
          }
          {listViewMode === "Student" && viewMode === "ResponseDetails" && this.renderSpotlightToggle()}
        </div>
      </div>
    );
  }

  private handleStudentSortSelect = (value: string) => () => {
    const { setStudentSort } = this.props;
    setStudentSort(value);
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
    const items: SelectItem[] = [{ value: SORT_BY_NAME, label: "Student Name",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_NAME) },
                                 { value: SORT_BY_FEEDBACK, label: "Awaiting Feedback",
                                   onSelect: this.handleStudentSortSelect(SORT_BY_FEEDBACK) }];
    const { sortByMethod, trackEvent } = this.props;
    return (
      <div className={cssClassNav.itemSort}>
        <CustomSelect
          dataCy={"sort-feedback"}
          HeaderIcon={SortIcon}
          items={items}
          trackEvent={trackEvent}
          value={sortByMethod}
          key={"feedback-sort"}
        />
      </div>
    );
  }

  private renderViewListOptions() {
    const { feedbackLevel, listViewMode, setListViewMode } = this.props;
    const listByStudentClasses = `${css.toggle} ${css.listByStudents} ${listViewMode==="Student" ? css.selected : ""}`;
    const listByQuestionsClasses = `${css.toggle} ${css.listByQuestions} ${listViewMode==="Question" ? css.selected : ""}  ${feedbackLevel === "Activity" ? css.disabled : ""}`;
    return (
      <div className={`${css.viewListOption} ${css.columnHeader}`}>View list by:
        <button className={listByStudentClasses} data-cy="list-by-student-toggle" onClick={() => setListViewMode("Student")}>
          <StudentViewIcon className={css.optionIcon} />
        </button>
        <button className={listByQuestionsClasses} data-cy="list-by-questions-toggle" onClick={() => setListViewMode("Question")} disabled={feedbackLevel === "Activity"}>
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

}

function mapStateToProps(state: any, ownProps?: any) {
  return (state: any, ownProps: any) => {
    const { answers, currentQuestion, feedbackLevel } = ownProps;
    if (feedbackLevel === "Question") {
      const questionId = currentQuestion.get("id");
      const questionFeedbacks = state.getIn(["feedback", "questionFeedbacks"]);
      const feedbacksGiven = [];
      questionFeedbacks.toArray().forEach((feedback: any) => {
        if (feedback.get("questionId") === questionId && feedback.get("feedback").trim() !== "") {
          feedbacksGiven.push(feedback);
        }
      });
      const feedbackCount = feedbacksGiven.length || 0;
      const studentAnswers = [];
      answers.toArray().forEach((item: any) => {
        item.forEach((ans: any) => {
          if (ans.get("questionId") === questionId) {
            studentAnswers.push(ans);
          }
        });
      });
      const numFeedbacksNeedingReview = studentAnswers.length - feedbackCount;
      return {
        numFeedbacksNeedingReview
      };
    } else {
      const getFeedbacks: any = makeGetStudentFeedbacks();
      const {
        numFeedbacksNeedingReview
      } = getFeedbacks(state, ownProps);
      return {
        numFeedbacksNeedingReview
      };
    }
  };
}

export default connect(mapStateToProps)(PopupClassNav);
