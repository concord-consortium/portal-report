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

export default firebase.firestore();
