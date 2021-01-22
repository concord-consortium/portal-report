import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { throttle } from "lodash";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  activityStarted: boolean;
  feedback: any;
  studentId: string;
  updateActivityFeedback?: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
}

export const ActivityFeedbackTextarea: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, activityStarted, feedback, studentId, updateActivityFeedback } = props;

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
    updateFeedbackThrottled();
  };

  const updateFeedback = () => {
    if (activityId && studentId && updateActivityFeedback && textareaRef.current?.value !== undefined) {
      const hasBeenReviewed = textareaRef.current.value !== "" ? true : false;
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: textareaRef.current?.value,
                                                                    hasBeenReviewed});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackThrottled = useCallback(throttle(updateFeedback, 2000), []);

  if (activityStarted) {
    return (
      <textarea
        data-cy="feedback-textarea"
        defaultValue={feedback}
        onBlur={updateFeedback}
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
