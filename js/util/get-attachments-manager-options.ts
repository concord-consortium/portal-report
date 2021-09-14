import { IAttachmentsManagerInitOptions } from "@concord-consortium/interactive-api-host";
import { fetchFirestoreJWTWithDefaultParams } from "../api";
import { getFirebaseAppName } from "../db";
import { urlParam } from "./misc";

export const isReportAnonymous = () => !!urlParam("runKey");

export const getAttachmentsManagerOptions = async (): Promise<IAttachmentsManagerInitOptions> => {
  let firestoreJWT;
  if (!isReportAnonymous()) {
    // If the report is anonymous, but we still try to get firestore JWT, we'll end up with fake JWT.
    // See: https://www.pivotaltracker.com/n/projects/2441249/stories/179540761
    firestoreJWT = await fetchFirestoreJWTWithDefaultParams("token-service");
  }
  return {
    tokenServiceEnv: getFirebaseAppName() === "report-service-pro" ? "production" : "staging",
    tokenServiceFirestoreJWT: firestoreJWT ? firestoreJWT.token : undefined
    // writeOptions are not necessary, as the Portal Report will never have to update any attachment.
  };
};
