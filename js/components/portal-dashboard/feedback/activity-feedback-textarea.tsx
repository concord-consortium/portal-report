import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { throttle } from "lodash";
import { TrackEventFunction } from "../../../actions";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  activityStarted: boolean;
  feedback: any;
  setFeedbackSortRefreshEnabled: (value: boolean) => void;
  studentId: string;
  updateActivityFeedback?: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
  isResearcher: boolean;
}

export const ActivityFeedbackTextarea: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, activityStarted, feedback, studentId, updateActivityFeedback, trackEvent, isResearcher } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ height, setHeight ] = useState(0);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      setHeight(textareaRef.current.scrollHeight);
    }
  }, [textareaRef]);

  const [ feedbackChanged, setFeedbackChanged ] = useState(false);

  const handleActivityFeedbackChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget as HTMLTextAreaElement;
    setHeight(target.scrollHeight);
    setFeedbackChanged(true);
    updateFeedbackThrottledAndNotLogged();
  };

  const updateFeedback = (logUpdate: boolean) => {
    if (activityId && studentId && updateActivityFeedback && textareaRef.current?.value !== undefined && !isResearcher) {
      if (logUpdate) {
        trackEvent("Portal-Dashboard", "AddActivityLevelFeedback", { label: feedback, parameters: { activityId, studentId }});
      }
      props.setFeedbackSortRefreshEnabled(true);
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: textareaRef.current?.value});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackThrottledAndNotLogged = useCallback(throttle(() => updateFeedback(false), 2000), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackLogged = useCallback(() => updateFeedback(true), []);

  if (activityStarted) {
    return (
      <textarea
        data-cy="feedback-textarea"
        defaultValue={feedback}
        onBlur={feedbackChanged ? updateFeedbackLogged : undefined}
        onChange={handleActivityFeedbackChange}
        placeholder={isResearcher ? "" : "Enter feedback"}
        ref={textareaRef}
        style={{ height: height + "px" }}
        disabled={isResearcher}
      />
    );
  }

  return (
    <p>This student hasn't started yet.</p>
  );
};
