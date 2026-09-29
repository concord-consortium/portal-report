export const MIN_DOWNLOAD_BUTTON_GAP = 16;

// All edges and widths are "outer": they include the element's horizontal margins.
export interface IFitMeasurements {
  assignmentRight: number;   // right edge of the Assignment selector
  ownerOuterLeft: number;    // left margin edge of the teacher's name, which never shrinks
  buttonOuterWidth: number;  // the button's width plus its margins
  buttonShown: boolean;
  buttonOuterLeft: number;   // only meaningful while the button is shown
}

// When the button is shown it sits between the Assignment selector and the name, so it fits
// if its left margin edge clears the selector. When it is hidden it takes no space, so it fits
// if the gap in front of the name could hold it. With .headerRight at min-width 0, the two
// checks give the same answer at every width, so the button can't flip back and forth.
export const downloadButtonFits = (m: IFitMeasurements) =>
  m.buttonShown
    ? m.buttonOuterLeft - m.assignmentRight >= MIN_DOWNLOAD_BUTTON_GAP
    : m.ownerOuterLeft - m.assignmentRight >= MIN_DOWNLOAD_BUTTON_GAP + m.buttonOuterWidth;

// Reads an element's box plus its horizontal margins.
export const outerBox = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const marginLeft = parseFloat(style.marginLeft) || 0;
  const marginRight = parseFloat(style.marginRight) || 0;
  return { left: rect.left - marginLeft, right: rect.right + marginRight, width: rect.width + marginLeft + marginRight };
};
