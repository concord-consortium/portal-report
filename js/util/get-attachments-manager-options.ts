import { IAttachmentsManagerInitOptions } from "@concord-consortium/interactive-api-host";
import { fetchFirestoreJWTWithDefaultParams } from "../api";
import { getFirebaseAppName } from "../db";

export const getAttachmentsManagerOptions = async (): Promise<IAttachmentsManagerInitOptions> => {
  const firestoreJWT = await fetchFirestoreJWTWithDefaultParams("token-service");
  return {
    tokenServiceEnv: getFirebaseAppName() === "report-service-pro" ? "production" : "staging",
    tokenServiceFirestoreJWT: firestoreJWT.token
    // writeOptions are not necessary, as the Portal Report will never have to update any attachment.
  };
};
