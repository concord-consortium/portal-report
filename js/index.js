import { Provider } from "react-redux";
import React from "react";
import { render } from "react-dom";
import App from "./containers/app";
import configureStore from "./store/configure-store";
import { initializeAuthorization } from "./api";
import { initializeDB } from "./db";

const redirecting = initializeAuthorization();
if(!redirecting) {
  initializeDB();
  const store = configureStore();
  window.store = store;

  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("app"),
  );
}
