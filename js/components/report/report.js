import React, { PureComponent } from "react";
import Sequence from "./sequence";
import Button from "../common/button";

import "../../../css/report/report.less";
import Sticky from "react-stickynode";

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
    const { report, reportTree } = this.props;
    const nowShowing = report.get("nowShowing") === "student";
    const className = nowShowing ? "report-content" : "report-content hidden";
    const selectedStudentId = report.get("selectedStudentId");
    let studentsToRender;
    if (selectedStudentId) {
      const selectedStudent = report.get("students").get(selectedStudentId);
      if (selectedStudent) {
        studentsToRender = [ selectedStudent ];
      } else {
        return <div>Selected student doesn't exist</div>;
      }
    } else {
      studentsToRender = report.get("students").toList();
    }
    return studentsToRender.map(s =>
        <div key={s.get("id")} className={className}>
          {this.renderReportHeader(s.get("name"))}
          <Sequence sequence={reportTree} reportFor={s} />
        </div>,
      );
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

  renderControls() {
    const { report } = this.props;
    const isAnonymous = report.get("anonymous");
    const nowShowing = report.get("nowShowing");
    const buttonText = (nowShowing === "class") ? "Print student reports" : "Print";
    const hideControls = report.get("hideControls");
    const anyQuestionSelected = report.get("questions").filter(question => question.get("selected") === true).size > 0;
    if (!hideControls) {
      return (
        <div className="controls">
          <Button onClick={this.onShowSelectedClick} disabled={!anyQuestionSelected}>Show selected</Button>
          <Button onClick={this.onShowUnselectedClick}>Show all</Button>
          <Button onClick={() => this.onShowHideNamesClick(isAnonymous)}>{isAnonymous ? "Show names" : "Hide names"}</Button>
          <Button onClick={this.printStudentReports}>{buttonText}</Button>
        </div>
      );
    } else {
      return ("");
    }
  }

  printStudentReports() {
    // Change report style to "per student" style.
    const { reportTree, setNowShowing, trackEvent } = this.props;
    setNowShowing("student");
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
      this.afterPrint();
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
