import React, { PureComponent } from "react";
import striptags from "striptags";

import css from "../../../css/dashboard/activity-questions.less";

export default class ActivityQuestions extends PureComponent {
  render() {
    const {
      activity, expanded, showFullPrompts,
      width, multChoiceSummary, setQuestionExpanded,
      expandedQuestions, trackEvent,
    } = this.props;

    const selectQuestion = this.props.selectQuestion;

    const headerSummaryClassName = css.questionPrompt + " " + css.multChoiceSummary + " " + (showFullPrompts ? css.fullPrompt : "");

    return (
      <div className={css.activityQuestions} style={{minWidth: width, width}}>
        <div className={css.content} data-cy="activityQuestions">
          {
            expanded && activity?.questions.filter(q => q?.visible).map(q => {
              const questionIsExpanded = expandedQuestions?.[q?.id.toString()];
              const promptExpanded = !!(showFullPrompts || questionIsExpanded);
              const openQuestionDetails = (e) => {
                // stop the click event from being handled by parent click handler
                // which would cause the question collumn to collapse.
                e.stopPropagation();
                selectQuestion(q?.id);
              };
              let trackAction = promptExpanded ? "Collapsed Question - " : "Expanded Question - ";
              trackAction = trackAction + q?.type;
              const trackLabel = activity?.name + " - " + q?.questionNumber + ". " + striptags(q?.prompt);
              const parameters = {
                promptExpanded,
                questionType: q?.type,
                activityName: activity?.name,
                questionNumber: q?.questionNumber,
                prompt: striptags(q?.prompt)
              };
              if (promptExpanded) {
                const headerClassName = `${css.questionPrompt} ${css.fullPrompt}`;
                return (
                  <div
                    key={q?.id}
                    className={headerClassName}
                    onClick={() => {
                      setQuestionExpanded(q?.id, false);
                      trackEvent("Dashboard", trackAction, {label: trackLabel, parameters});
                    }}
                    data-cy="activityQuestionsText">
                    <span
                      onClick={(e) => {
                        openQuestionDetails(e);
                        trackEvent("Dashboard", "Opened Question Details", {label: trackLabel, parameters});
                      }}
                      className={css["icomoon-expander"]}
                      data-cy="expand-question-details" />
                    Q{ q?.questionNumber }. { striptags(q?.prompt) }
                  </div>
                );
              } else {
                const headerClassName = css.questionPrompt;
                return (
                  <div
                    key={q?.id}
                    className={headerClassName}
                    onClick={() => {
                      setQuestionExpanded(q?.id, true);
                      trackEvent("Dashboard", trackAction, {label: trackLabel, parameters});
                    }}
                    data-cy="activity-question-toggle">
                    Q{ q?.questionNumber }.

                  </div>
                );
              }
            })
          }
          {
            expanded && multChoiceSummary &&
            <div className={headerSummaryClassName}>Correct</div>
          }
          {
            // Fake question prompt, just to add cell with the border.
            !expanded && <div className={`${css.questionPrompt} ${css.blankCell}`} />
          }
        </div>
      </div>
    );
  }
}
