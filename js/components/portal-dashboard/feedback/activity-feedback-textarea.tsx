import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { throttle } from "lodash";

interface IProps {
  activityId: string | null;
  activityIndex: number;
  feedback: any;
  studentId: string;
  updateActivityFeedback?: (activityId: string, activityIndex: number, platformStudentId: string, feedback: any) => void;
}

export const ActivityFeedbackTextarea: React.FC<IProps> = (props) => {
  const { activityId, activityIndex, feedback, studentId, updateActivityFeedback } = props;

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
    if (activityId && studentId && updateActivityFeedback) {
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: textareaRef.current?.value});
      // eslint-disable-next-line no-console
      console.log(textareaRef.current?.value);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackThrottled = useCallback(throttle(updateFeedback, 2000), []);

  return (
    <textarea
      ref={textareaRef}
      defaultValue={feedback}
      placeholder="Enter feedback"
      onChange={handleActivityFeedbackChange}
      style={{ height: height + "px" }}
      data-cy="feedback-textarea"
    />
  );
};
