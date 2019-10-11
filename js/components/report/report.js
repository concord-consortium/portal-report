import React, { PureComponent } from "react";
import Sequence from "./sequence";
import Button from "../common/button";

import "../../../css/report/report.less";
import Sticky from "react-stickynode";

const MAX_STUDENT_REPORTS = 20;

export default class Report extends PureComponent {
  constructor(props) {
    super(props);
    this.printStudentReports = this.printStudentReports.bind(this);
    this.printMediaQueryListener = this.printMediaQueryListener.bind(this);
  }

  componentDidMount() {
    const { report, reportTree } = this.props;
    const nowShowing = report.get("nowShowing");
    const student = report.get("students").length > 0 ? report.get("students").first().get("name") : "";
    const title = nowShowing === "class" ? `Report for ${report.get("clazzName")}` : `Report for ${student}`;
    document.title = `${reportTree.get("name")} ${title}`;
  }

  renderReportHeader(clazzName) {
    return (
      <Sticky top={0} className="main" activeClass="active">
        <div className="report-header">
          <div className="title">
            <h1>Report for: {clazzName}</h1>
          </div>
          {this.renderControls()}
        </div>
      </Sticky>
    );
  }

  renderClassReport() {
    const { report, reportTree } = this.props;
    const nowShowing = report.get("nowShowing");
    const className = nowShowing === "class" ? "report-content" : "report-content hidden";
    return (
      <div className={className}>
        {this.renderReportHeader(report.get("clazzName"))}
        <Sequence sequence={reportTree} reportFor={"class"} />
      </div>
    );
  }

  renderStudentReports() {
    const { report, reportTree, sortedStudents } = this.props;
    if (report.get("nowShowing") !== "student") {
      return null;
    }
    const selectedStudentIds = report.get("selectedStudentIds");
    let studentsToRender;
    if (selectedStudentIds) {
      studentsToRender = selectedStudentIds.map(sId => report.get("students").get(sId)).filter(s => !!s);
      if (studentsToRender.size === 0) {
        return <div>Selected student doesn't exist</div>;
      }
    } else {
      studentsToRender = sortedStudents;
    }
    return studentsToRender.map(s =>
        <div key={s.get("id")} className="report-content">
          {this.renderReportHeader(s.get("name"))}
          <Sequence sequence={reportTree} reportFor={s} />
        </div>
      );
  }

  renderPrintButtons() {
    const { sortedStudents } = this.props;
    if (sortedStudents.size <= MAX_STUDENT_REPORTS) {
      return <Button onClick={this.printStudentReports}>Print student reports</Button>;
    }
    const btnCount = Math.ceil(sortedStudents.size / MAX_STUDENT_REPORTS);
    return (
      <span>
        {
          Array.from({ length: btnCount }).map((v, idx) =>
          {
            const min = idx * MAX_STUDENT_REPORTS;
            const max = Math.min((idx + 1) * MAX_STUDENT_REPORTS, sortedStudents.size);
            return <Button key={idx} onClick={this.printStudentReports.bind(this, min, max)}>
              { idx === 0 ? "Print student reports: " : ""} {min + 1}-{max}
            </Button>;
          })
        }
      </span>
    );

  }

  renderControls() {
    const { report } = this.props;
    const isAnonymous = report.get("anonymous");
    const hideControls = report.get("hideControls");
    const anyQuestionSelected = report.get("questions").filter(question => question.get("selected") === true).size > 0;
    if (!hideControls) {
      return (
        <div className="controls">
          <Button onClick={this.onShowSelectedClick} disabled={!anyQuestionSelected}>Show selected</Button>
          <Button onClick={this.onShowUnselectedClick}>Show all</Button>
          <Button onClick={() => this.onShowHideNamesClick(isAnonymous)}>{isAnonymous ? "Show names" : "Hide names"}</Button>
          { this.renderPrintButtons() }
        </div>
      );
    } else {
      return null;
    }
  }

  onShowSelectedClick = () => {
    const { reportTree, hideUnselectedQuestions, trackEvent } = this.props;
    hideUnselectedQuestions();
    trackEvent("Report", "Show Selected Question(s)", reportTree.get("name"));
  }

  onShowUnselectedClick = () => {
    const { reportTree, showUnselectedQuestions, trackEvent } = this.props;
    showUnselectedQuestions();
    trackEvent("Report", "Show All Questions", reportTree.get("name"));
  }

  onShowHideNamesClick = (isAnonymous) => {
    const { setAnonymous, trackEvent } = this.props;
    const trackAction = isAnonymous ? "Show Student Names" : "Hide Student Names";
    trackEvent("Report", trackAction, "");
    return setAnonymous(!isAnonymous);
  }

  printStudentReports(studentStartIdx = 0, studentEndIdx = MAX_STUDENT_REPORTS) {
    // Change report style to "per student" style.
    const { reportTree, setNowShowing, trackEvent, sortedStudents } = this.props;
    const studentSubset = sortedStudents.slice(studentStartIdx, studentEndIdx).map(s => s.get("id"));
    setNowShowing("student", studentSubset);
    // setTimeout is necessary, as and re-render is async. Not the nicest way, but it's simple and self-contained.
    setTimeout(() => window.print(), 1);
    this.setupAfterPrintListener();
    trackEvent("Report", "Print Student Reports", reportTree.get("name"));
  }

  afterPrint() {
    // Go back to the default report style ("per class").
    const { setNowShowing, report } = this.props;
    const type = report.get("type");
    setNowShowing(type);
    this.cleanupAfterPrintListener();
  }

  // It's difficult to detect when user closes the print dialog in a cross-browser way.
  // This method seems to work for our needs in modern browsers. See:
  // http://stackoverflow.com/a/11060206
  setupAfterPrintListener() {
    this.mediaQueryList = window.matchMedia("print");
    this.mediaQueryList.addListener(this.printMediaQueryListener);
  }

  cleanupAfterPrintListener() {
    this.mediaQueryList.removeListener(this.printMediaQueryListener);
  }

  printMediaQueryListener(mql) {
    if (!mql.matches) {
      // setTimeout fixes a React problem. Without it, React complains about:
      // "Uncaught Invariant Violation: Maximum update depth exceeded. This can happen when a component
      // repeatedly calls setState inside componentWillUpdate or componentDidUpdate."
      // My blind guess might be that print dialog stops execution of the main JS thread and another state update
      // happens too early.
      setTimeout(() => { this.afterPrint(); }, 1);
    }
  }

  render() {
    return (
      <div>
        {this.renderClassReport()}
        {this.renderStudentReports()}
      </div>
    );
  }
}
