import * as firebase from "firebase";
import "firebase/firestore";
import { urlParam } from "./util/misc";

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

async function initializeDB(name: string) {
  const config = configurations[name];
  firebase.initializeApp(config);

  // The following flags are useful for tests. It makes it possible to clear the persistence
  // at the beginning of a test, and enable perisistence on each visit call
  // this way the tests can run offline but still share firestore state across visits
  //
  // WARNING: as far as I can tell persistence is based on the domain of the page.
  // So if persistence is enabled on a page loaded from the
  // portal-report.concord.org domain this will likely affect all tabs in the same browser
  // regardless of what branch or version of the portal report code that tab is running.
  // Cypress runs its test in a different browser instance so its persistence should not pollute
  // non-cypress tabs
  if (urlParam("clearFirestorePersistence")) {
    // debugger;
    // we cannot enable the persistence until the
    // clearing is complete, so this await is necessary
    await firebase.firestore().clearPersistence();
  }

  if (urlParam("enableFirestorePersistence")) {
    await firebase.firestore().enablePersistence({ synchronizeTabs: true });
  }

  // The disableNetwork call happens in the api.ts fetchPortalDataAndAuthFirestore
  // it is currently disabled whenever fake data is being used

  return firebase.firestore();
}

export const FIREBASE_APP = urlParam("firebase-app") || "report-service-dev";

// Intended usage is firestoreInitialized.then(db => [do something with the db]);
// The code using this promise could ignore the result here and just call firebase.firestore()
// inside of the then, but using the result makes it easier to to say all direct calls to
// firebase.firestore() should be here in db.ts
export const firestoreInitialized = initializeDB(FIREBASE_APP);

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
