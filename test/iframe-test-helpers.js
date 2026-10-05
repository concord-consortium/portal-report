import { act } from "@testing-library/react";
import iframePhone from "iframe-phone";

export const answerState = value => JSON.stringify({ interactiveState: JSON.stringify({ value }) });

// iframe-phone mock is defined in __mocks__/iframe-phone.ts; it answers the phone after 1ms
export const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 20)));

// Each mounted InteractiveIframe creates one ParentEndpoint, so a redraw is one more instance.
export const iframeCount = () => iframePhone._parentInstances.length;

export const shownValue = () => {
  const phone = iframePhone._parentInstances[iframeCount() - 1];
  const inits = phone.post.mock.calls.filter(([type]) => type === "initInteractive");
  return inits.length > 0 ? inits[inits.length - 1][1].interactiveState.value : undefined;
};

// Jest crashes printing jsdom's document.body in a failure message, so focus assertions compare this name instead.
export const focusedElement = () =>
  document.activeElement === document.body ? "page" : document.activeElement.tagName.toLowerCase();
