import { useCallback, useEffect, useRef, useState } from "react";
import firebase from "firebase";
import "firebase/firestore";

import { GlossaryAudioParams, GlossaryAudioPortalParams } from "./use-glossary-audio-params";
import { getFirebaseAppName, getFirestore, IConfig } from "../../../db";
import { checkStatus, getAuthHeader } from "../../../api";

type PluginState = {
  definitions: Record<string, string[]>;
}

type PartialClassInfo = {
  id: number;
  name: string;
  class_hash: string;
  offerings: {id: number; name: string}[];
}
export type GlossaryAudio = Record<string, string[]>;

const glossaryFirebaseConfig: IConfig = {
  apiKey: atob("QUl6YVN5QU9DRlFpT2VjaG1TY09vSnRZTFBTdjFrcWRzZjlzcjFZ"),
  authDomain: "glossary-plugin.firebaseapp.com",
  databaseURL: "https://glossary-plugin.firebaseio.com",
  projectId: "glossary-plugin",
  storageBucket: "glossary-plugin.appspot.com",
  messagingSenderId: "137541784121",
  appId: "1:137541784121:web:f1881d868bfd3d647f73e8",
  measurementId: "G-RJYWLT2NE4"
};

const demoSource = "demo-source";
const demoContextId = "demo-context";

const audioCache: Record<string,string> = {};

export const useGlossaryAudio = (params: GlossaryAudioParams) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>(undefined);
  const [glossaryAudio, setGlossaryAudio] = useState<GlossaryAudio>({});
  const [classInfo, setClassInfo] = useState<PartialClassInfo|undefined>(undefined);
  const glossaryDBRef = useRef<firebase.firestore.Firestore|undefined>(undefined);

  // for now just return demo data
  useEffect(() => {
    if (params.demo) {
      setGlossaryAudio({
        "Pedagogy": [`recordingData://${demoSource}/${demoContextId}/pedagogy`, `recordingData://${demoSource}/${demoContextId}/pedagogy`],
        "Curriculum": [`recordingData://${demoSource}/${demoContextId}/curriculum`],
        "Assessment": [`recordingData://${demoSource}/${demoContextId}/assessment`],
      });
      setLoading(false);
    } else {
      const getPluginData = async () => {
        const classInfo = await getClassInfo(params);
        setClassInfo(classInfo);

        // get the plugin state from the report service db
        const reportServiceJWT = await getFirebaseJWT(params, getFirebaseAppName(), classInfo.class_hash);
        await signInWithToken(reportServiceJWT.token);
        const reportServiceDB = await getFirestore();
        // the default db code disables the network unless dashboard parameters are present, so we need to re-enable it
        await reportServiceDB.enableNetwork();
        const pluginState = await getGlossaryPluginState(params, reportServiceDB);
        setGlossaryAudio(convertPluginStateToGlossaryAudio(pluginState));

        // then login to the glossary db so we can get the audio content when requested
        const glossaryApp = firebase.initializeApp(glossaryFirebaseConfig, "glossary");
        glossaryDBRef.current = glossaryApp.firestore();
        const glossaryJWT = await getFirebaseJWT(params, "glossary-plugin", classInfo.class_hash);
        await signInWithToken(glossaryJWT.token, glossaryApp);

        setLoading(false);
      };

      getPluginData()
        .catch((error) => setError(error.toString()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudio = useCallback((word: string, index: number): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
      const url = glossaryAudio[word][index];

      if (audioCache[url]) {
        resolve(new Audio(audioCache[url]));
        return;
      }

      if (params.demo) {
        return getDemoAudio(url, word)
          .then(audio => resolve(audio))
          .catch(reject);
      }

      if (!glossaryDBRef.current) {
        reject("Not logged into glossary database!");
        return;
      }

      return getFirebaseAudio(url, word, glossaryDBRef.current)
        .then(audio => resolve(audio))
        .catch(reject);
    });
  }, [glossaryAudio, params]);

  return {loading, error, classInfo, glossaryAudio, loadAudio};
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

const getClassInfo = async ({portalUrl, classId}: GlossaryAudioPortalParams): Promise<PartialClassInfo> => {
  const url = `${portalUrl}/api/v1/classes/${classId}`;
  const resp = await fetch(url, {headers: {Authorization: getAuthHeader()}});
  checkStatus(resp);
  return await resp.json();
};

const getFirebaseJWT = async ({portalUrl, offeringId, userId}: GlossaryAudioPortalParams, firebaseAppName: string, classHash: string) => {
  const url = `${portalUrl}/api/v1/jwt/firebase?firebase_app=${firebaseAppName}&class_hash=${classHash}&resource_link_id=${offeringId}&target_user_id=${userId}`;
  const resp = await fetch(url, {headers: {Authorization: getAuthHeader()}});
  checkStatus(resp);
  return await resp.json();
};

const signInWithToken = async (firebaseJWT: string, app?: firebase.app.App) => {
  const auth = app ? app.auth() : firebase.auth();
  await auth.signOut();
  await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
  await auth.signInWithCustomToken(firebaseJWT);
};

const getGlossaryPluginState = async (params: GlossaryAudioPortalParams, db: firebase.firestore.Firestore) => {
  if (params.demo) {
    throw new Error("Can't get plugin state for demo!");
  }

  const path = `/sources/${params.sourceKey}/plugin_states/${params.pluginDataKey}`;
  const docRef = db.doc(path);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Unable to find glossary audio info!");
  }
  try {
    return JSON.parse(doc.data()?.state) as PluginState;
  }
  catch (e) {
    throw new Error("Unable to read glossary info!");
  }
};

const convertPluginStateToGlossaryAudio = ({definitions}: PluginState): GlossaryAudio => {
  return Object.keys(definitions).reduce<GlossaryAudio>((acc, word) => {
    const recordings = definitions[word].filter(definition => definition.startsWith("recordingData://"));
    if (recordings.length > 0) {
      recordings.reverse();
      acc[word] = recordings;
    }
    return acc;
  }, {});
};

const getDemoAudio = async (url: string, word: string): Promise<HTMLAudioElement> => {
  const resp = await fetch(`demo-audio/${word.toLowerCase()}-base64-audio.txt`);
  if (resp.status !== 200) {
    throw new Error(`Demo audio file for ${word} not found`);
  }
  const audioData = (await resp.text()).trim();
  audioCache[url] = audioData;
  return new Audio(audioData);
};

const getFirebaseAudio = async (url: string, word: string, glossaryDB: firebase.firestore.Firestore): Promise<HTMLAudioElement> => {
  const {source, contextId, id} = parseRecordingUrl(url);
  if (!source || !contextId || !id) {
    throw new Error("Invalid glossary audio recording url!");
  }

  const path = `/sources/${source}/contextId/${contextId}/recordingData/${id}`;
  const docRef = glossaryDB.doc(path);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Unable to find glossary recording!");
  }
  const data = doc.data();
  if (!data?.audioBlobUrl) {
    throw new Error("No audio info found in glossary recording!");
  }

  return new Audio(data.audioBlobUrl);
};

