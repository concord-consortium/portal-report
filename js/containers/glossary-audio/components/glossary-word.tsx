import React, { useMemo } from "react";
import { CurrentWord } from "../glossary-audio-app";

import css from "../../../../css/glossary-audio/glossary-word.less";

type Props = {
  word: string;
  currentWord?: CurrentWord;
  onClick: (word: string) => void;
}

function GlossaryWord({word, currentWord, onClick}: Props) {
  const handleClick = () => onClick(word);

  const isPlaying = useMemo(() => currentWord && currentWord.word === word && currentWord.playing, [currentWord, word]);

  const renderPlayStop = () => {
    const className = `${css.button} ${isPlaying ? css.playing : ""}`;
    if (isPlaying) {
      return <button className={className} onClick={handleClick}>Stop</button>;
    }
    return <button className={className} onClick={handleClick}>Play</button>;
  };

  return (
    <tr>
      <td><span className={css.word}>{word}</span></td>
      <td>{renderPlayStop()}</td>
    </tr>
  );
}

export default GlossaryWord;
