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
}

export const ActivityFeedbackTextarea: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, activityStarted, feedback, studentId, updateActivityFeedback, trackEvent } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ height, setHeight ] = useState(0);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      setHeight(textareaRef.current.scrollHeight);
    }
  }, [textareaRef]);

  const handleActivityFeedbackChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget as HTMLTextAreaElement;
    setHeight(target.scrollHeight);
    updateFeedbackThrottledAndNotLogged();
  };

  const updateFeedback = (logUpdate: boolean) => {
    if (activityId && studentId && updateActivityFeedback && textareaRef.current?.value !== undefined) {
      const hasBeenReviewed = textareaRef.current.value !== "" ? true : false;
      if (logUpdate) {
        trackEvent("Portal-Dashboard", "AddActivityLevelFeedback", { label: feedback, parameters: { activityId, studentId }});
      }
      props.setFeedbackSortRefreshEnabled(true);
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: textareaRef.current?.value,
                                                                    hasBeenReviewed});
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
        onBlur={updateFeedbackLogged}
        onChange={handleActivityFeedbackChange}
        placeholder="Enter feedback"
        ref={textareaRef}
        style={{ height: height + "px" }}
      />
    );
  }

  return (
    <p>This student hasn't started yet.</p>
  );
};
