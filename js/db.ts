import * as firebase from "firebase";
import "firebase/firestore";

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCvxKWuYDgJ4r4o8JeNAOYusx0aV71_YuE",
  authDomain: "report-service-dev.firebaseapp.com",
  databaseURL: "https://report-service-dev.firebaseio.com",
  projectId: "report-service-dev",
  storageBucket: "report-service-dev.appspot.com",
  messagingSenderId: "402218300971",
  appId: "1:402218300971:web:32b7266ef5226ff7"
});

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

export default firebase.firestore();
