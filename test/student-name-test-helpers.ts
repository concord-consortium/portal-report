// Helpers for tests of names made by `StudentNameWithMarker`. Styles map to their own class names in tests.

const textWithout = (element: Element, selector: string) => {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll(selector).forEach(el => el.remove());
  return copy.textContent;
};

// The text a sighted user sees. Leaves out the text that only screen readers get.
export const shownText = (element: Element) => textWithout(element, ".screenReaderOnly");

// The text a screen reader gets. Leaves out the text hidden from screen readers.
export const screenReaderText = (element: Element) => textWithout(element, "[aria-hidden=true]");
