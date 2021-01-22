import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { throttle } from "lodash";
import { answerHash } from "../../../util/misc";
import { Map } from "immutable";

interface IProps {
  answerId: string;
  answer: Map<string, any>;
  feedback: any;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
}

export const QuestionFeedbackTextarea: React.FC<IProps> = (props) => {
  const { answerId, feedback, updateQuestionFeedback } = props;

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
    updateFeedbackThrottled();
  };

  const updateFeedback = () => {
    if (answerId && textareaRef.current?.value !== undefined) {
      updateQuestionFeedback(answerId, {feedback: textareaRef.current?.value,
                                        hasBeenReviewedForAnswerHash: answerHash(props.answer)});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFeedbackThrottled = useCallback(throttle(updateFeedback, 2000), []);

  return (
    <textarea
      ref={textareaRef}
      defaultValue={feedback}
      placeholder="Enter feedback"
      onChange={handleQuestionFeedbackChange}
      style={{ height: height + "px" }}
      data-cy="feedback-textarea"
      onBlur={updateFeedback}
    />
  );
};
