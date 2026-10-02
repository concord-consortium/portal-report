// While focus is inside a cross-origin iframe, the parent document reports the iframe element as active.
export const iframeHasFocus = (container: HTMLElement | null | undefined) => {
  const focused = document.activeElement;
  return focused?.tagName === "IFRAME" && !!container?.contains(focused);
};

export const focusIframe = (container: HTMLElement | null | undefined) => {
  container?.querySelector("iframe")?.focus();
};
