import React, { useLayoutEffect, useRef, useState } from "react";

interface IProps {
  answerHash: any;
  answerId: string;
  feedback: any;
  updateQuestionFeedback: (answerId: string, feedback: any) => void;
}

export const QuestionFeedbackTextarea: React.FC<IProps> = (props) => {
  const { answerHash, answerId, feedback, updateQuestionFeedback } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [ height, setHeight ] = useState(0);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      setHeight(textareaRef.current.scrollHeight);
    }
  }, [textareaRef]);

  const handleQuestionFeedbackChange = (answerId: string | undefined) => (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (answerId) {
      const target = event.currentTarget as HTMLTextAreaElement;
      updateQuestionFeedback(answerId, {feedback: target.value});
      updateQuestionFeedback(answerId, {hasBeenReviewedForAnswerHash: answerHash});
      setHeight(target.scrollHeight);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      defaultValue={feedback}
      placeholder="Enter feedback"
      onChange={handleQuestionFeedbackChange(answerId)}
      style={{ height: height + "px" }}
      data-cy="feedback-textarea"
    />
  );
};
