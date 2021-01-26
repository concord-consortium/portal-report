import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { throttle } from "lodash";
import { answerHash } from "../../../util/misc";
import { Map } from "immutable";
import { TrackEventFunction } from "../../../actions";

interface IProps {
  answer: Map<string, any>;
  answerId: string;
  feedback: any;
  studentId: string | null;
  questionId: string | null;
  activityId: string | null;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
  trackEvent: TrackEventFunction;
}

export const QuestionFeedbackTextarea: React.FC<IProps> = (props) => {
  const { answer, answerId, feedback, studentId, questionId, activityId, updateQuestionFeedback, trackEvent } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ height, setHeight ] = useState(0);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      setHeight(textareaRef.current.scrollHeight);
    }
  }, [textareaRef]);

  const handleQuestionFeedbackChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget as HTMLTextAreaElement;
    setHeight(target.scrollHeight);
    updateFeedbackThrottledAndNotLogged();
  };

  const updateFeedback = (logUpdate: boolean) => {
    const feedback = textareaRef.current?.value;
    if (answerId && feedback !== undefined) {
      if (logUpdate) {
        trackEvent("Portal-Dashboard", "AddQuestionLevelFeedback", { label: feedback, parameters: { activityId, studentId, questionId, answerId }});
      }
      updateQuestionFeedback(answerId, {feedback, hasBeenReviewedForAnswerHash: answerHash(answer)});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackThrottledAndNotLogged = useCallback(throttle(() => updateFeedback(false), 2000), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackLogged = useCallback(() => updateFeedback(true), []);

  return (
    <textarea
      ref={textareaRef}
      defaultValue={feedback}
      placeholder="Enter feedback"
      onChange={handleQuestionFeedbackChange}
      style={{ height: height + "px" }}
      data-cy="feedback-textarea"
      onBlur={updateFeedbackLogged}
    />
  );
};
