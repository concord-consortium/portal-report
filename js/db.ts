import * as firebase from "firebase";
import "firebase/firestore";

interface IConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
interface IConfigs {
  [index: string]: IConfig;
}
const configurations: IConfigs = {
  "report-service-dev": {
    apiKey: "AIzaSyCvxKWuYDgJ4r4o8JeNAOYusx0aV71_YuE",
    authDomain: "report-service-dev.firebaseapp.com",
    databaseURL: "https://report-service-dev.firebaseio.com",
    projectId: "report-service-dev",
    storageBucket: "report-service-dev.appspot.com",
    messagingSenderId: "402218300971",
    appId: "1:402218300971:web:32b7266ef5226ff7"
  },
  "report-service-pro": {
    apiKey: "AIzaSyBmNSa2Uz3DaEwKclsvHPBwfucSmZWAAzg",
    authDomain: "report-service-pro.firebaseapp.com",
    databaseURL: "https://report-service-pro.firebaseio.com",
    projectId: "report-service-pro",
    storageBucket: "report-service-pro.appspot.com",
    messagingSenderId: "22386066971",
    appId: "1:22386066971:web:e0cdec7cb0f0893a8a5abe"
  }
};

export let db: firebase.firestore.Firestore;

export function initializeDB(name: string) {
  const config = configurations[name];
  firebase.initializeApp(config);
  db = firebase.firestore();
}

// Useful only for manual testing Firebase rules.
const SKIP_SIGN_IN = false;

export const signInWithToken = (rawFirestoreJWT: string) => {
  // It's actually useful to sign out first, as firebase seems to stay signed in between page reloads otherwise.
  const signOutPromise = firebase.auth().signOut();
  if (!SKIP_SIGN_IN) {
    return signOutPromise.then(() => firebase.auth().signInWithCustomToken(rawFirestoreJWT));
  } else {
    return signOutPromise;
  }
};
