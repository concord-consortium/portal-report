import { Map } from "immutable";
import { IOpaqueObjectStorageConfig } from "@concord-consortium/interactive-api-host";

import config from "../config";
import { getAppConfig } from "../db";

export const getObjectStorageConfig = (report: Map<string, any>, question: Map<string, any>): IOpaqueObjectStorageConfig => {
  const objectStorageConfig: IOpaqueObjectStorageConfig = {
    version: 1,
    type: "firebase",
    app: getAppConfig(),
    root: `sources/${config("answersSourceKey") || report.get("sourceKey")}`,
    user: {
      type: "authenticated",
      jwt: report.get("rawFirestoreJWT"),
      contextId: report.get("contextId"),
      platformId: report.get("platformId"),
      platformUserId: report.get("platformUserId"),
      resourceLinkId: report.get("resourceLinkId"),
    },
    questionId: question.get("id"),
  };

  return objectStorageConfig;
};
