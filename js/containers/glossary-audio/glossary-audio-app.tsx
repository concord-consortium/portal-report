import React, { useCallback, useEffect, useMemo, useState } from "react";
import classNames from "classnames";

import { useGlossaryAudio } from "./hooks/use-glossary-audio";
import GlossaryWord from "./components/glossary-word";
import { useGlossaryAudioParams } from "./hooks/use-glossary-audio-params";

import ccLogoSrc from "../../../img/cc-logo.png";

import css from "../../../css/glossary-audio/glossary-audio-app.less";


export type CurrentWord = {
  word: string;
  index: number;
  audio: HTMLAudioElement;
  setAt: number;
  playing: boolean;
}

function GlossaryAudioApp() {
  const params = useGlossaryAudioParams();
  const {loading, error, classInfo, glossaryAudio, loadAudio} = useGlossaryAudio(params);
  const [currentWord, setCurrentWord] = useState<CurrentWord|undefined>();
  const words = useMemo(() => {
    const words = Object.keys(glossaryAudio);
    words.sort();
    return words;
  }, [glossaryAudio]);

  useEffect(() => {
    document.title = "Glossary Audio";
  }, []);

  const handleWordClicked = useCallback((word: string, index: number) => {
    if (currentWord && currentWord.word === word && currentWord.playing) {
      currentWord.audio.pause();
      return;
    }

    loadAudio(word, index)
      .then(audio => {
        setCurrentWord({word, index, audio, setAt: Date.now(), playing: true});
        audio.addEventListener("pause", () => {
          setCurrentWord(prev => prev ? {...prev, playing: false} : prev);
        });
        audio.play();
      })
      .catch(alert);
  }, [currentWord, loadAudio, setCurrentWord]);

  const renderStudentInfo = () => {
    if (params.demo) {
      return <div className={css.studentInfo}>DEMO STUDENT</div>;
    }

    const {studentId, classId, offeringId} = params;
    const className = `Class ${classId}`;  // need to anonymize name
    const offering = classInfo?.offerings.find(offering => String(offering.id) === offeringId);
    const offeringName = offering ? `${offering.name} (Offering ${offeringId})` : `Offering ${offeringId}`;

    return (
      <div className={css.studentInfo}>
        {`Student ${studentId} / ${className} / ${offeringName}`}
      </div>
    );
  };

  const renderAudio = () => {
    if (loading) {
      return (<div>Loading...</div>);
    }

    if (words.length === 0) {
      return (<div>No audio definitions found for student.</div>);
    }

    return (
      <table>
        <tbody>
          {words.map(word => <GlossaryWord key={word} word={word} numAudioRecordings={glossaryAudio[word].length} currentWord={currentWord} onClick={handleWordClicked} />)}
        </tbody>
      </table>
    );
  };

  const renderError = () => <div className={css.error}>{error}</div>;

  const renderContents = () => {
    return (
      <>
        {renderStudentInfo()}
        <div className={css.info}><strong>NOTE:</strong> Each word may have multiple audio definitions. If so, they are ordered from newest to oldest.</div>
        {renderAudio()}
      </>
    );
  };

  const className = classNames(css.glossaryAudioApp, {[css.demo]: params.demo});

  return (
    <div className={className}>
      <h1><img src={ccLogoSrc} className={css.logo} data-cy="header-logo"/> Glossary Audio</h1>
      <div className={css.contents}>
        {error && renderError()}
        {loading ? "Loading ..." : renderContents()}
      </div>
    </div>
  );
}

export default GlossaryAudioApp;
