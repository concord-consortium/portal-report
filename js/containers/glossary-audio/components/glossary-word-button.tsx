import React, { useMemo } from "react";
import { CurrentWord } from "../glossary-audio-app";

import css from "../../../../css/glossary-audio/glossary-word.less";

type Props = {
  word: string;
  index: number;
  currentWord?: CurrentWord;
  onClick: (word: string, index: number) => void;
}

function GlossaryWordButton({word, index, currentWord, onClick}: Props) {
  const handleClick = () => onClick(word, index);

  const isPlaying = useMemo(() => currentWord && currentWord.word === word && currentWord.index === index && currentWord.playing, [currentWord, word, index]);

  const className = `${css.button} ${isPlaying ? css.playing : ""}`;
  if (isPlaying) {
    return <button className={className} onClick={handleClick}>Stop</button>;
  }
  return <button className={className} onClick={handleClick}>Play</button>;
}

export default GlossaryWordButton;
