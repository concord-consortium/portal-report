export type GlossaryAudioDemoParams = {
  demo: true;
}

export type GlossaryAudioPortalParams = {
  demo: false;
  sourceKey: string;
  pluginDataKey: string;
  portalUrl: string;
  studentId: string;
  userId: string;
  classId: string;
  offeringId: string;
}

export type GlossaryAudioParams = GlossaryAudioDemoParams | GlossaryAudioPortalParams

export const useGlossaryAudioParams = (): GlossaryAudioParams => {
  const params = new URLSearchParams(window.location.search);
  const sourceKey = params.get("sourceKey") ?? undefined;
  const portalUrl = params.get("portalUrl") ?? undefined;
  const pluginDataKey = params.get("pluginDataKey") ?? undefined;
  const studentId = params.get("studentId") ?? undefined;
  const userId = params.get("userId") ?? undefined;
  const classId = params.get("classId") ?? undefined;
  const offeringId = params.get("offeringId") ?? undefined;
  if (sourceKey !== undefined && portalUrl !== undefined && pluginDataKey !== undefined && studentId !== undefined && userId !== undefined && classId !== undefined && offeringId !== undefined) {
    return {demo: false, sourceKey, portalUrl, pluginDataKey, studentId, userId, classId, offeringId};
  }
  return { demo: true };
};
