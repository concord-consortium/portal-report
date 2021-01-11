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

export const DEFAULT_FIREBASE_APP = "report-service-dev";

export function getFirebaseAppName(): string {
  return urlParam("firebase-app") || DEFAULT_FIREBASE_APP;
}

let firestoreDBPromise: Promise<firebase.firestore.Firestore> | null = null;

export function initializeDB() {
  firestoreDBPromise = createDB();
}

async function createDB() {
  const name = getFirebaseAppName();

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
    // we cannot enable the persistence until the
    // clearing is complete, so this await is necessary
    await firebase.firestore().clearPersistence();
  }

  if (urlParam("enableFirestorePersistence")) {
    await firebase.firestore().enablePersistence({ synchronizeTabs: true });
  }

  if(!(urlParam("class") || urlParam("offering") || urlParam("activity"))){
    // The report was not provided any params to load in the activity structure
    // In this case we are going to be using fake activity or sequence structure
    // This might be because we are running an automated test, or because the report is being
    // manually demo'd
    // In either case we don't want to make network connections to server.
    await firebase.firestore().disableNetwork();

    // Note: We could load the database with the fake data at this point, so then
    // the code in actions/index.ts would be more simple.
    // We would be loading in the fake sequence and activity structure under the
    // fake.authoring.system source.
    // And load in the fake answers which match with it.
    // Which fake structure and fake answers to load could be specified in URL params
  }

  return firebase.firestore();
}

// Intended usage is getFirestore().then(db => [do something with the db]);
// The code using this promise could ignore the result here and just call firebase.firestore()
// inside of the then, but using getFirestore() makes it easier to to say all direct calls to
// firebase.firestore() should be here in db.ts
export const getFirestore = (): Promise<firebase.firestore.Firestore> => {
  if(firestoreDBPromise == null) {
    throw new Error("firestore needs to be initialized first");
  }
  return firestoreDBPromise;
};

// Useful only for manual testing Firebase rules.
const SKIP_SIGN_IN = false;

export const signInWithToken = (rawFirestoreJWT: string) => {
  // It's actually useful to sign out first, as firebase seems to stay signed in between page reloads otherwise.
  const signOutPromise = firebase.auth().signOut();
  if (!SKIP_SIGN_IN) {
    return signOutPromise.then(() => {
      return firebase.auth().signInWithCustomToken(rawFirestoreJWT);
    });
  } else {
    return signOutPromise;
  }
};
