// import * as firebase from "firebase";
// firebase.firestore.setLogLevel("debug");

import { Provider } from "react-redux";
import React from "react";
import { render } from "react-dom";
import App from "./containers/app";
import configureStore from "./store/configure-store";
import { initializeAuthorization } from "./api";
import { initializeDB } from "./db";
import { initializeAttachmentsManager } from "@concord-consortium/interactive-api-host";
import { getAttachmentsManagerOptions } from "./util/get-attachments-manager-options";

const redirecting = initializeAuthorization();
if(!redirecting) {
  initializeDB();
  getAttachmentsManagerOptions().then(options => initializeAttachmentsManager(options));

  const store = configureStore();
  window.store = store;

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("app"),
  );
}
