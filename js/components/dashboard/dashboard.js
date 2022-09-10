import React, { PureComponent } from "react";
import ActivityName from "./activity-name";
import StudentName from "./student-name";
import ActivityQuestions from "./activity-questions";
import ActivityAnswers from "./activity-answers";
import ExpandStudents from "./expand-students";
import QuestionDetails from "../../containers/dashboard/question-details";

import css from "../../../css/dashboard/dashboard.less";

import {
  BOTTOM_MARGIN,
  COLLAPSED_ACTIVITY_WIDTH,
  COLLAPSED_ANSWER_WIDTH,
  FULL_ANSWER_WIDTH,
  MC_SUMMARY_APPROX_WIDTH,
} from "./const-metrics";

export default class Dashboard extends PureComponent {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
    this.onHorizontalContainerScroll = this.onHorizontalContainerScroll.bind(this);
    this.onHeadersScroll = this.onHeadersScroll.bind(this);
    this.selectNoQuestions = this.selectNoQuestions.bind(this);
  }

  componentDidMount() {
    // Make sure that the verticalScrollContainer fits the window height.
    window.addEventListener("resize", this.onResize);
    // Synchronize scrolling of headers and horizontalScrollContainer.
    this.horizontalScrollingContainer.addEventListener("scroll", this.onHorizontalContainerScroll);
    this.activityHeaders.addEventListener("scroll", this.onHeadersScroll);
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    this.horizontalScrollingContainer.removeEventListener("scroll", this.onHorizontalContainerScroll);
    this.activityHeaders.removeEventListener("scroll", this.onHeadersScroll);
  }

  selectNoQuestions() {
    const { selectQuestion } = this.props;
    selectQuestion(null);
  }

  onResize() {
    // Make sure that the verticalScrollContainer fits the window height.
    const bb = this.mainContainer.getBoundingClientRect();
    this.mainContainer.style.height = (window.innerHeight - bb.y - BOTTOM_MARGIN) + "px";
  }

  onHorizontalContainerScroll() {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.activityHeaders, this.onHeadersScroll);
    this.activityHeaders.scrollLeft = this.horizontalScrollingContainer.scrollLeft;
  }

  onHeadersScroll() {
    // Synchronize scrolling of headers and horizontalScrollContainer.
    // Make sure there's no loop of scroll events. It causes weird effects and containers end up out of sync.
    this.ignoreNextScrollEvent(this.horizontalScrollingContainer, this.onHorizontalContainerScroll);
    this.horizontalScrollingContainer.scrollLeft = this.activityHeaders.scrollLeft;
  }

  ignoreNextScrollEvent(element, originalHandler) {
    // Temporarily replace scroll handler and restore it after it's triggered once.
    const temporaryHandler = () => {
      element.removeEventListener("scroll", temporaryHandler);
      element.addEventListener("scroll", originalHandler);
    };
    element.removeEventListener("scroll", originalHandler);
    element.addEventListener("scroll", temporaryHandler);
  }

  shouldShowMultChoiceSummary(activity) {
    return activity?.questions && activity?.questions.some(q =>
      q?.visible && q?.type === "multiple_choice" && q?.scored,
    );
  }

  getNumberOfActivityColumns(activity) {
    return activity?.questions.filter(q => q?.visible).count() +
      (this.shouldShowMultChoiceSummary(activity) ? 1 : 0);
  }

  getNumberOfExpandedQuestions(activity) {
    const { expandedQuestions, expandedStudents } = this.props;
    const numberOfQuestions = this.getNumberOfActivityColumns(activity);
    if (expandedStudents.includes(true)) {
      return numberOfQuestions;
    }
    return activity?.questions.filter(q => expandedQuestions?.[q.get("id")]).count();
  }

  getMultChoiceSummaryWidth(activity, collapsed) {
    if (
      activity?.questions &&
      activity?.questions.some(q =>
        q?.visible &&
        q?.type === "multiple_choice" &&
        q?.scored,
      )
    ) {
      return MC_SUMMARY_APPROX_WIDTH;
    }
    return 0;
  }

  getActivityColumnWidth(activity) {
    const { expandedActivities } = this.props;
    if (expandedActivities?.[activity.get("id")]) {
      const numberOfExpandedQuestions = this.getNumberOfExpandedQuestions(activity);
      const numberOfClosedQuestions = this.getNumberOfActivityColumns(activity) - numberOfExpandedQuestions;
      const width = numberOfClosedQuestions * COLLAPSED_ANSWER_WIDTH +
        numberOfExpandedQuestions * FULL_ANSWER_WIDTH +
        this.getMultChoiceSummaryWidth(activity);
      return Math.max(COLLAPSED_ACTIVITY_WIDTH, width) + "px";
    }
    return COLLAPSED_ACTIVITY_WIDTH + "px";
  }

  render() {
    const {
      activities, students, studentProgress, expandedStudents,
      expandedActivities, setActivityExpanded, setStudentExpanded,
      setStudentsExpanded, setQuestionExpanded, expandedQuestions,
      selectedQuestion, selectQuestion, trackEvent,
    } = this.props;
    const anyStudentExpanded = expandedStudents.includes(true);
    const anyQuestionExpanded = expandedQuestions.includes(true);
    const showTallQuestionHeader = anyStudentExpanded || anyQuestionExpanded;
    const activitiesList = activities.toList().filter(activity => activity?.visible);
    return (
      <div ref={el => { this.mainContainer = el; }} className={css.dashboard}>
        <div className={css.innerContainer}>
          <QuestionDetails
            selectedQuestion={selectedQuestion}
            students={students}
            onClose={this.selectNoQuestions}
          />
          <div className={css.headers}>
            <ExpandStudents setStudentsExpanded={setStudentsExpanded} students={students} expandedStudents={expandedStudents} trackEvent={trackEvent} />
            <div ref={el => { this.activityHeaders = el; }} className={css.activityHeaders} data-cy="activityHeaders">
              <div>
                {
                  activitiesList.map((a, num) =>
                    <ActivityName key={a?.id}
                      activity={a}
                      width={this.getActivityColumnWidth(a)}
                      number={num + 1}
                      expanded={expandedActivities?.[a.get("id")]} setActivityExpanded={setActivityExpanded} trackEvent={trackEvent} />,
                  )
                }
              </div>
              <div className={css.questionPromptsRow + " " + (showTallQuestionHeader ? css.fullPrompts : "")}>
                {
                  activitiesList.map(a =>
                    <ActivityQuestions
                      key={a?.id}
                      activity={a}
                      width={this.getActivityColumnWidth(a)}
                      expanded={expandedActivities?.[a.get("id")]}
                      showFullPrompts={anyStudentExpanded}
                      multChoiceSummary={this.shouldShowMultChoiceSummary(a)}
                      setQuestionExpanded={setQuestionExpanded}
                      expandedQuestions={expandedQuestions}
                      selectQuestion={selectQuestion}
                      trackEvent={trackEvent}
                    />,
                  )
                }
              </div>
            </div>
          </div>
          <div className={css.verticalScrollContainer}>
            <div className={css.studentNames}>
              {
                students.map(s => {
                  const studentExpanded = expandedStudents?.[s.get("id")];
                  const expanded = anyQuestionExpanded || studentExpanded;
                  return (
                    <StudentName
                      key={s?.id}
                      student={s}
                      studentExpanded={studentExpanded}
                      expanded={expanded}
                      setStudentExpanded={setStudentExpanded}
                      trackEvent={trackEvent} />
                  );
                })
              }
            </div>
            <div ref={el => { this.horizontalScrollingContainer = el; }} className={css.horizontalScrollContainer}>
              {
                students.map(s => {
                  const expandedStudent = expandedStudents?.[s.get("id")];
                  const expanded = anyQuestionExpanded || expandedStudent;

                  return (
                    <div
                      key={s?.id}
                      className={css.studentAnswersRow + " " + (expanded ? css.fullAnswers : "")} data-cy="studentAnswersRow">
                      {
                        activitiesList.map(a =>
                          <ActivityAnswers key={a?.id} activity={a} student={s}
                            width={this.getActivityColumnWidth(a)}
                            anyStudentExpanded={anyStudentExpanded}
                            expanded={expandedActivities?.[a.get("id")]}
                            showFullAnswers={expandedStudents?.[s.get("id")]}
                            progress={studentProgress.getIn([s?.id, a?.id])}
                            multChoiceSummary={this.shouldShowMultChoiceSummary(a)}
                            setQuestionExpanded={setQuestionExpanded}
                            expandedQuestions={expandedQuestions}
                          />,
                        )
                      }
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.defaultProps = {
  activities: Map(),
  students: List(),
  expandedStudents: Map(),
  expandedActivities: Map(),
  expandedQuestions: Map(),
  studentProgress: Map(),
  selectedQuestion: Map(),
  selectQuestion: (e) => console.warn("selectQuestion prop undefined"),
};
