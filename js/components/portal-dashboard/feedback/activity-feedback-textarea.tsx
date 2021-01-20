import React, { useLayoutEffect, useRef, useState } from "react";

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

  const handleActivityFeedbackChange = (studentId: string | undefined) => (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (activityId && studentId && updateActivityFeedback) {
      const target = event.currentTarget as HTMLTextAreaElement;
      updateActivityFeedback(activityId, activityIndex, studentId, {feedback: target.value});
      setHeight(target.scrollHeight);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      defaultValue={feedback}
      placeholder="Enter feedback"
      onChange={handleActivityFeedbackChange(studentId)}
      style={{ height: height + "px" }}
      data-cy="feedback-textarea"
    />
  );
};
