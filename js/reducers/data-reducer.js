import { Map } from "immutable";
import {
  REQUEST_PORTAL_DATA,
  RECEIVE_RESOURCE_STRUCTURE,
  FETCH_ERROR,
} from "../actions";

const INITIAL_DATA_STATE = Map({
  isFetching: true
});

export default function data(state = INITIAL_DATA_STATE, action) {
  switch (action.type) {
    case REQUEST_PORTAL_DATA:
      return state.set("isFetching", true);
    case RECEIVE_RESOURCE_STRUCTURE:
      return state.set("isFetching", false);
    case FETCH_ERROR:
      return state.set("isFetching", false)
                  .set("error", action.response);
    default:
      return state;
  }
}
