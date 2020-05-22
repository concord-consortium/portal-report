import { RecordFactory } from "../util/record-factory";
import {
  REQUEST_PORTAL_DATA,
  RECEIVE_RESOURCE_STRUCTURE,
  FETCH_ERROR,
} from "../actions";

export interface IDataState {
  isFetching: boolean;
  error?: any;
}

const INITIAL_DATA_STATE = RecordFactory<IDataState>({
  isFetching: true
});

export class DataState extends INITIAL_DATA_STATE {
  constructor(config: Partial<IDataState>) {
    super(config);
  }
}

export default function data(state = new DataState({}), action: any) {
  switch (action && action.type) {
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