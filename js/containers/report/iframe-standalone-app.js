import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Map } from "immutable";
import { fetchAndObserveData } from "../../actions/index";
import DataFetchError from "../../components/report/data-fetch-error";
import LoadingIcon from "../../components/report/loading-icon";
import InteractiveIframe from "../../components/report/interactive-iframe";
import Answer from "../../components/report/answer";
import { getAnswerTrees, getInteractiveStateHistoryTree } from "../../selectors/report-tree";
import config from "../../config";
import { interactiveStateHistoryCache } from "../../util/interactive-state-history-cache";
import { InteractiveStateHistoryRangeInput } from "../../components/portal-dashboard/interactive-state-history-range-input";

import "../../../css/report/report-app.less";
import "../../../css/report/iframe-standalone-app.less";

class IframeStandaloneApp extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      answer: null,
      latestAnswer: null,
      isLoadingAnswer: true,
      loadingError: null,
      startedAnswerLoadAt: null,
      interactiveStateHistory: null,
      myInteractiveStateHistories: null,
      interactiveStateHistoryId: null,
    };

    this.handleSetInteractiveStateHistoryId = this.handleSetInteractiveStateHistoryId.bind(this);
  }

  componentDidMount() {
    const { fetchAndObserveData } = this.props;
    fetchAndObserveData();
  }

  // in order to support showing interactive state history by id we need move the answer from the mapped state to props
  // and instead check if there is a specific interactive state history id to load once all data has been fetched
  // and if so load that instead of the normal answer lookup and set it in state
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isFetching, error, answers, interactiveStateHistories, sourceKey } = nextProps;

    if (isFetching || error) {
      return;
    }

    // wait until we have answers loaded, timeout after 15 seconds
    if (answers.size === 0) {
      const now = Date.now();
      if (!this.state.startedAnswerLoadAt) {
        this.setState({ startedAnswerLoadAt: now });
      } else if (now - this.state.startedAnswerLoadAt > 15000) {
        this.setState({ isLoadingAnswer: false, loadingError: "Timed out loading answers"});
      }
      return;
    }

    const iframeQuestionId = config("iframeQuestionId");
    const platformUserId = config("studentId") || config("runKey");

    const myInteractiveStateHistories = interactiveStateHistories.filter(ish =>
      ish.get("questionId") === iframeQuestionId &&
      ish.get("platformUserId") === platformUserId
    );

    // see if we need to get a specific interactive state history
    const interactiveStateHistoryId = config("interactiveStateHistoryId");
    if (interactiveStateHistoryId) {
      // wait until we have interactive state histories loaded, timeout after 15 seconds
      if (interactiveStateHistories.size === 0) {
        const now = Date.now();
        if (!this.state.startedAnswerLoadAt) {
          this.setState({ startedAnswerLoadAt: now });
        } else if (now - this.state.startedAnswerLoadAt > 15000) {
          this.setState({ isLoadingAnswer: false, loadingError: `Timed out loading interactive state history for id: '${interactiveStateHistoryId}'`});
        }
        return;
      }

      const interactiveStateHistory = myInteractiveStateHistories.filter(ish =>
        ish.get("id") === interactiveStateHistoryId
      ).first();

      if (interactiveStateHistory) {
        interactiveStateHistoryCache.get(sourceKey, interactiveStateHistoryId, (error, data) => {
          if (error) {
            this.setState({ isLoadingAnswer: false, loadingError: `Error fetching interactive state history data for id: '${interactiveStateHistoryId}': ${error.message}`});
          } else {
            this.setState({
              isLoadingAnswer: false,
              answer: Map(data),
              interactiveStateHistoryId
            });
          }
        });
      } else {
        this.setState({ isLoadingAnswer: false, loadingError: `No interactive state history found for requested id: '${interactiveStateHistoryId}'`});
      }
    }

    // check explicit studentId first for logged in users and then fall back to runKey for anonymous users
    const answer = answers.filter(a =>
      a.get("questionId") === iframeQuestionId &&
      a.get("platformUserId") === platformUserId
    ).first();

    if (interactiveStateHistoryId) {
      // isLoadingAnswer will be set false when the interactive state history load completes but we still want to
      // set the latest answer and myInteractiveStateHistories in state so that the range input has a value
      // to use when switching back to latest answer
      this.setState({ latestAnswer: answer, myInteractiveStateHistories });
    } else {
      this.setState({ isLoadingAnswer: false, latestAnswer: answer, answer, myInteractiveStateHistories });
    }
  }

  handleSetInteractiveStateHistoryId(newId) {
    const { sourceKey } = this.props;
    const { myInteractiveStateHistories } = this.state;

    if (newId) {
      const interactiveStateHistory = myInteractiveStateHistories.filter(ish =>
          ish.get("id") === newId
        ).first();

      if (interactiveStateHistory) {
        this.setState({ interactiveStateHistoryId: newId, isLoadingAnswer: true });
        interactiveStateHistoryCache.get(sourceKey, newId, (error, data) => {
          if (error) {
            this.setState({ isLoadingAnswer: false, loadingError: `Error fetching interactive state history data for id: '${newId}': ${error.message}`});
          } else {
            this.setState({ isLoadingAnswer: false, answer: Map(data), interactiveStateHistory });
          }
        });
      }
    } else {
      // reset to latest answer
      this.setState({ isLoadingAnswer: false, interactiveStateHistoryId: null, answer: this.state.latestAnswer, loadingError: null });
    }
  }

  renderIframe() {
    const { answer, loadingError, myInteractiveStateHistories, interactiveStateHistoryId } = this.state;
    const { report } = this.props;
    const iframeQuestionId = config("iframeQuestionId");

    const question = report.get("questions").get(iframeQuestionId);

    // check explicit studentId first for logged in users and then fall back to runKey for anonymous users
    const platformUserId = config("studentId") || config("runKey");

    if (!answer) {
      const errorText =
        !iframeQuestionId ? "Parameter 'iframeQuestionId' is missing" :
        !platformUserId ? "Parameter 'studentId' or 'runKey' is missing" :
        loadingError || `No data for question '${iframeQuestionId}' by student '${platformUserId}'`;
      return <DataFetchError error={{title: "Unable to fetch data", body: errorText}} />;
    }

    const answerType = answer.get("type");
    if (answerType === "interactive_state" || answerType === "external_link") {
      // This will handle the main use case - rendering of the interactive iframe. Note that Answer component would
      // also handle it if we provided alwaysOpen=true, but it wouldn't try to make it full screen, and so on.
      // It seems to be easier to render custom InteractiveIframe here.
      let url;
      let state;
      // There are two supported answer types handled by iframe question: simple link or interactive state.
      if (answerType === "external_link") {
        // Answer field is just the reportable URL. We don't need any state.
        url = answer.get("answer");
        state = null;
      } else if (answerType === "interactive_state") {
        // URL field is provided by question. Answer field is a state that will be passed
        // to the iframe using iframe-phone.
        url = question.get("url");
        const answerVal = answer.get("answer");
        state = typeof answerVal === "string" ? JSON.parse(answerVal) : answerVal;
        state.view = "standalone";
      }

      return (
        <div className="container">
          <InteractiveIframe
            key={`iframe-${answer.get("id")}-${interactiveStateHistoryId || "latest"}`}
            src={url}
            state={state}
            answer={answer}
            style={{border: "none"}} width="100%" height="100%"
          />
          {myInteractiveStateHistories && myInteractiveStateHistories.size > 0 &&
            <div className="range-input">
              <InteractiveStateHistoryRangeInput
                answer={answer}
                interactiveStateHistory={myInteractiveStateHistories}
                interactiveStateHistoryId={interactiveStateHistoryId}
                setInteractiveStateHistoryId={this.handleSetInteractiveStateHistoryId}
              />
          </div>}
        </div>
      );
    } else {
      // This will handle all the other answers like open response, multiple choice, or image question.
      return <Answer question={question} answer={answer} />;
    }
  }

  render() {
    const { isLoadingAnswer } = this.state;
    const { report, error, isFetching } = this.props;
    return (
      <div className="report-app full-size">
        <div className="report full-size" style={{ opacity: isFetching ? 0.3 : 1 }} data-cy="standaloneIframe">
          {report && !isLoadingAnswer && this.renderIframe()}
          {error && <DataFetchError error={error} />}
        </div>
        {(isFetching || isLoadingAnswer) && !error && <LoadingIcon />}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const data = state.get("data");
  const error = data.get("error");
  const reportState = state.get("report");
  const dataDownloaded = !error && !data.get("isFetching");
  return {
    report: dataDownloaded && reportState,
    answers: dataDownloaded && getAnswerTrees(state),
    interactiveStateHistories: dataDownloaded && getInteractiveStateHistoryTree(state),
    isFetching: data.get("isFetching"),
    error,
    sourceKey: config("answersSourceKey") || state.getIn(["report", "sourceKey"])
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAndObserveData: () => dispatch(fetchAndObserveData())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IframeStandaloneApp);
