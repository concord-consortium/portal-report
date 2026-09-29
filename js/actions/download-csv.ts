import { Dispatch } from "redux";
import { buildDashboardCsvRows, getDashboardCsvFileName } from "../util/dashboard-csv";
import { csvFromRows } from "../util/csv";
import { saveTextFile } from "../util/save-file";
import { trackEvent } from "./index";
import { RootState } from "../reducers";

export const downloadDashboardCsv = () => (dispatch: Dispatch<any>, getState: () => RootState) => {
  const state = getState();
  const csv = csvFromRows(buildDashboardCsvRows(state));
  saveTextFile(getDashboardCsvFileName(state, new Date()), csv, "text/csv;charset=utf-8");
  dispatch(trackEvent("Portal-Dashboard", "DownloadCSV"));
};
