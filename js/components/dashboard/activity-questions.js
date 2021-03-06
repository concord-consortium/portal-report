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
            expanded && activity.get("questions").filter(q => q.get("visible")).map(q => {
              const questionIsExpanded = expandedQuestions.get(q.get("id").toString());
              const promptExpanded = !!(showFullPrompts || questionIsExpanded);
              const openQuestionDetails = (e) => {
                // stop the click event from being handled by parent click handler
                // which would cause the question collumn to collapse.
                e.stopPropagation();
                selectQuestion(q.get("id"));
              };
              let trackAction = promptExpanded ? "Collapsed Question - " : "Expanded Question - ";
              trackAction = trackAction + q.get("type");
              const trackLabel = activity.get("name") + " - " + q.get("questionNumber") + ". " + striptags(q.get("prompt"));
              const parameters = {
                promptExpanded,
                questionType: q.get("type"),
                activityName: activity.get("name"),
                questionNumber: q.get("questionNumber"),
                prompt: striptags(q.get("prompt"))
              };
              if (promptExpanded) {
                const headerClassName = `${css.questionPrompt} ${css.fullPrompt}`;
                return (
                  <div
                    key={q.get("id")}
                    className={headerClassName}
                    onClick={() => {
                      setQuestionExpanded(q.get("id"), false);
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
                    Q{ q.get("questionNumber") }. { striptags(q.get("prompt")) }
                  </div>
                );
              } else {
                const headerClassName = css.questionPrompt;
                return (
                  <div
                    key={q.get("id")}
                    className={headerClassName}
                    onClick={() => {
                      setQuestionExpanded(q.get("id"), true);
                      trackEvent("Dashboard", trackAction, {label: trackLabel, parameters});
                    }}
                    data-cy="activity-question-toggle">
                    Q{ q.get("questionNumber") }.

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
