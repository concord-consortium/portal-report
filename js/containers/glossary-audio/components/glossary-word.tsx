import React from "react";
import { CurrentWord } from "../glossary-audio-app";

import css from "../../../../css/glossary-audio/glossary-word.less";
import GlossaryWordButton from "./glossary-word-button";

type Props = {
  word: string;
  numAudioRecordings: number;
  currentWord?: CurrentWord;
  onClick: (word: string, index: number) => void;
}

function GlossaryWord({word, numAudioRecordings, currentWord, onClick}: Props) {

  const buttons: React.ReactElement[] = [];
  for (let i = 0; i < numAudioRecordings; i++) {
    buttons.push(<GlossaryWordButton key={`${i}-${word}`} word={word} index={i} currentWord={currentWord} onClick={onClick} />);
  }

  return (
    <tr>
      <td><span className={css.word}>{word}</span></td>
      <td>{buttons}</td>
    </tr>
  );
}

export default GlossaryWord;
