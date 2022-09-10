import React, { PureComponent } from "react";
import ReactDom from "react-dom";
import Button from "../../components/common/button";
import FeedbackFilter from "../../components/report/feedback-filter";
import FeedbackOverview from "../../components/report/feedback-overview";
import FeedbackRow from "../../components/report/feedback-row";
import FeedbackButton from "../../components/report/feedback-button";
import SummaryIndicator from "../../components/report/summary-indicator";
import FeedbackOptionsView from "../../components/report/feedback-options-view";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { connect } from "react-redux";
import { updateQuestionFeedback, updateQuestionFeedbackSettings } from "../../actions/index";
import { MANUAL_SCORE, MAX_SCORE_DEFAULT } from "../../util/scoring-constants";
import "../../../css/report/feedback-panel.less";
import { feedbackValidForAnswer } from "../../util/misc";

class QuestionFeedbackPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showOnlyNeedReview: true,
      showFeedbackPanel: false,
    };
    this.studentRowRefs = {};
    this.makeOnlyNeedReview = this.makeOnlyNeedReview.bind(this);
    this.makeShowAll = this.makeShowAll.bind(this);
    this.showFeedback = this.showFeedback.bind(this);
    this.hideFeedback = this.hideFeedback.bind(this);
    this.answerIsMarkedComplete = this.answerIsMarkedComplete.bind(this);
    this.enableText = this.enableText.bind(this);
    this.enableScore = this.enableScore.bind(this);
    this.setMaxScore = this.setMaxScore.bind(this);
    this.scrollStudentIntoView = this.scrollStudentIntoView.bind(this);
    this.studentRowRef = this.studentRowRef.bind(this);
  }

  makeOnlyNeedReview() {
    this.setState({ showOnlyNeedReview: true });
  }

  makeShowAll() {
    this.setState({ showOnlyNeedReview: false });
  }

  showFeedback() {
    this.setState({
      showFeedbackPanel: true,
    });
  }

  hideFeedback() {
    this.setState({
      showFeedbackPanel: false,
    });
  }

  answerIsMarkedComplete(answer) {
    const feedback = this.getFeedback(answer);
    return feedbackValidForAnswer(feedback, answer);
  }

  enableText(event) {
    this.props.updateQuestionFeedbackSettings(this.props.question.get("id"), { feedbackEnabled: event.target.checked });
  }

  enableScore(event) {
    this.props.updateQuestionFeedbackSettings(this.props.question.get("id"), { scoreEnabled: event.target.checked });
  }

  setMaxScore(value) {
    const {updateQuestionFeedbackSettings, question} = this.props;
    if (updateQuestionFeedbackSettings) {
      updateQuestionFeedbackSettings(question.get("id"), { maxScore: value });
    }
  }

  studentRowRef(index) {
    return `student-row-${index}`;
  }

  scrollStudentIntoView(eventProxy) {
    const index = eventProxy.target.value;
    const ref = this.studentRowRef(index - 1);
    const itemComponent = this.studentRowRefs[ref];
    if (itemComponent) {
      // eslint-disable-next-line react/no-find-dom-node
      const domNode = ReactDom.findDOMNode(itemComponent);
      domNode.scrollIntoView();
    }
  }

  renderGettingStarted() {
    return (
      <div className="getting-started">
        <div className="explainer">
          To start, choose the type of feedback you want to leave in the Feedback Type settings above.
        </div>
        <div className="arrow">⤴</div>
      </div>
    );
  }

  render() {
    const { question, answers, students } = this.props;
    const answerByStudentId = {};
    answers.forEach(a => answerByStudentId[a.get("platformUserId")] = a);
    const answersIncNoResponse = students.map(s => answerByStudentId[s.get("id")] || fromJS({ student: s, questionType: "NoAnswer" }));
    const showing = this.state.showFeedbackPanel;
    const prompt = question.get("prompt");
    const num = question.get("questionNumber");
    const needingFeedback = answers.filter(a => !this.answerIsMarkedComplete(a));

    const filteredAnswers = this.state.showOnlyNeedReview ? needingFeedback : answersIncNoResponse;
    const scores = answers.map( (a) => this.getFeedback(a))
      .map(f => f.get("score"))
      .filter(f => f != null)
      .toArray();

    const numAnswers = answers.count();
    const numNoAnswers = students.count() - numAnswers;
    let numNeedsFeedback = needingFeedback.count();
    let numFeedbackGiven = numAnswers - numNeedsFeedback;

    const questionSettings = this.getFeedbackSettings(question);
    const scoreEnabled = questionSettings.get("scoreEnabled") || false;
    const feedbackEnabled = questionSettings.get("feedbackEnabled") || false;
    const maxScore = questionSettings.get("maxScore") || MAX_SCORE_DEFAULT;

    const showGettingStarted = !scoreEnabled && !feedbackEnabled;
    const studentsPulldown = filteredAnswers.map((a) => {
      return {
        realName: a.getIn(["student", "realName"]),
        id: a.getIn(["student", "id"]),
        answer: a,
      };
    });

    if (!scoreEnabled && !feedbackEnabled) {
      numNeedsFeedback = 0;
      numFeedbackGiven = 0;
    }

    if (!showing) {
      return (
        <div className="feedback-container">
          <FeedbackButton
            feedbackEnabled={feedbackEnabled || scoreEnabled}
            needsReviewCount={numNeedsFeedback}
            disabled={numAnswers < 1}
            showFeedback={this.showFeedback} />

          <SummaryIndicator
            scores={scores}
            showScore={numAnswers > 0 && scoreEnabled}
            maxScore={maxScore}
          />
        </div>);
    }
    return (
      <div className="feedback-container">
        <div className="lightbox-background" />
        <div className="feedback-panel">
          <h1>Feedback: Question {num}</h1>
          <div className="prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
          <div className="feedback-header">
            <FeedbackOverview
              numNoAnswers={numNoAnswers}
              numFeedbackGiven={numFeedbackGiven}
              numNeedsFeedback={numNeedsFeedback}
            />
            <FeedbackOptionsView
              useRubric={false}
              rubricAvailable={false}
              scoreEnabled={scoreEnabled}
              scoreType={MANUAL_SCORE}
              maxScore={maxScore}
              enableText={this.enableText}
              toggleScoreEnabled={this.enableScore}
              showText={feedbackEnabled}
              setMaxScore={this.setMaxScore}
            />
          </div>

          <div className="main-feedback">
            <FeedbackFilter
              showOnlyNeedReview={this.state.showOnlyNeedReview}
              studentSelected={this.scrollStudentIntoView}
              makeOnlyNeedReview={this.makeOnlyNeedReview}
              students={studentsPulldown}
              makeShowAll={this.makeShowAll}
              disable={showGettingStarted}
            />

            <div className="feedback-rows-wrapper">
              {showGettingStarted ? this.renderGettingStarted() : ""}
              <div className="feedback-for-students">
                <TransitionGroup className="answer">
                  {filteredAnswers.map((answer, i) =>
                    <CSSTransition key={i} timeout={500} classNames="answer" >
                      <FeedbackRow
                        answer={answer}
                        question={question}
                        ref={(row) => { this.studentRowRefs[this.studentRowRef(i)] = row; }}
                        key={answer.get("id")}
                        scoreEnabled={scoreEnabled}
                        feedbackEnabled={feedbackEnabled}
                        maxScore={maxScore}
                        feedback={this.getFeedback(answer)}
                        updateQuestionFeedback={this.props.updateQuestionFeedback}
                        showOnlyNeedsRiew={this.state.showOnlyNeedReview}
                      />
                    </CSSTransition>,
                  )}
                </TransitionGroup>
              </div>
            </div>
          </div>
          <div className="footer">
            <Button onClick={this.hideFeedback} data-cy="feedback-done-button">Done</Button>
          </div>
        </div>
      </div>

    );
  }

  getFeedbackSettings(question) {
    return this.props.settings.getIn(["questionSettings", question.get("id")]) || Map({});
  }

  getFeedback(answer) {
    const newFeedback = fromJS({
      answerId: answer.get("id"),
      feedback: "✖ No Feedback Yet",
      score: "0",
      hasBeenReviewedForAnswerHash: "",
      classHash: answer.get("classHash"),
      platformUserId: answer.get("platformUserId")
    });
    return this.props.questionFeedbacks.get(answer.get("id")) || newFeedback;
  }
}

function mapStateToProps(state) {
  return {
    questionFeedbacks: state.getIn(["feedback", "questionFeedbacks"]),
    settings: state.getIn(["feedback", "settings"])
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateQuestionFeedback: (answerId, feedback) => dispatch(updateQuestionFeedback(answerId, feedback)),
    updateQuestionFeedbackSettings: (embeddableKey, feedbackFlags) => dispatch(updateQuestionFeedbackSettings(embeddableKey, feedbackFlags)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionFeedbackPanel);
