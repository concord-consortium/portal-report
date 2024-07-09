import { useCallback, useEffect, useState } from "react";

export type GlossaryAudio = Record<string, string>;

const demoSource = "demo-source";
const demoContextId = "demo-context";

const audioCache: Record<string,string> = {};

export const useGlossaryAudio = () => {
  const [loading, setLoading] = useState(true);
  const [glossaryAudio, setGlossaryAudio] = useState<GlossaryAudio>({});

  // for now just return demo data
  useEffect(() => {
    setGlossaryAudio({
      "Pedagogy": `recordingData://${demoSource}/${demoContextId}/pedagogy`,
      "Curriculum": `recordingData://${demoSource}/${demoContextId}/curriculum`,
      "Assessment": `recordingData://${demoSource}/${demoContextId}/assessment`,
    });
    setLoading(false);
  }, []);

  const loadAudio = useCallback((word: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
      const url = glossaryAudio[word];

      if (audioCache[url]) {
        resolve(new Audio(audioCache[url]));
        return;
      }

      const {source} = parseRecordingUrl(url);

      if (source === demoSource) {
        fetch(`demo-audio/${word.toLowerCase()}-base64-audio.txt`)
          .then(resp => {
            if (resp.status === 200) {
              return resp.text();
            } else {
              reject(`Demo audio file for ${word} not found`);
              return "";
            }
          })
          .then(base64data => {
            const audioData = base64data.trim();
            audioCache[url] = audioData;
            resolve(new Audio(audioData));
          })
          .catch(reject);
        return;
      }

      reject("Real glossary audio recordings are not available yet!");
    });
  }, [glossaryAudio]);

  return {loading, glossaryAudio, loadAudio};
};

const parseRecordingUrl = (url: string) => {
  const m = url.match(/^recordingData:\/\/(.+)\/(.+)\/(.+)$/);
  if (m) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [full, source, contextId, id, ...rest] = m;
    return { valid: true, source, contextId, id };
  }
  return { valid: false };
};

