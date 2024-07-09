import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGlossaryAudio } from "./hooks/use-glossary-audio";
import GlossaryWord from "./components/glossary-word";

import css from "../../../css/glossary-audio/glossary-audio-app.less";

import ccLogoSrc from "../../../img/cc-logo.png";

export type CurrentWord = {
  word: string;
  audio: HTMLAudioElement;
  setAt: number;
  playing: boolean;
}

function GlossaryAudioApp() {
  const {loading, glossaryAudio, loadAudio} = useGlossaryAudio();
  const [currentWord, setCurrentWord] = useState<CurrentWord|undefined>();
  const words = useMemo(() => Object.keys(glossaryAudio), [glossaryAudio]);

  useEffect(() => {
    document.title = "Glossary Audio";
  }, []);

  const handleWordClicked = useCallback((word: string) => {
    if (currentWord && currentWord.word === word && currentWord.playing) {
      currentWord.audio.pause();
      return;
    }

    loadAudio(word)
      .then(audio => {
        setCurrentWord({word, audio, setAt: Date.now(), playing: true});
        audio.addEventListener("pause", () => {
          setCurrentWord(prev => prev ? {...prev, playing: false} : prev);
        });
        audio.play();
      })
      .catch(alert);
  }, [currentWord, loadAudio, setCurrentWord]);

  const renderAudio = () => {
    if (loading) {
      return (<div>Loading...</div>);
    }

    if (words.length === 0) {
      return (<div>No audio definitions found for student.</div>);
    }

    words.sort();
    return (
      <table>
        <tbody>
          {words.map(word => <GlossaryWord key={word} word={word} currentWord={currentWord} onClick={handleWordClicked} />)}
        </tbody>
      </table>
    );
  };

  return (
    <div className={css.glossaryAudioApp}>
      <h1><img src={ccLogoSrc} className={css.logo} data-cy="header-logo"/> Glossary Audio</h1>
      <div className={css.contents}>
        <div className={css.info}>There are {words.length} audio definitions for words in the glossary by this user.</div>
        {renderAudio()}
      </div>
    </div>
  );
}

export default GlossaryAudioApp;
