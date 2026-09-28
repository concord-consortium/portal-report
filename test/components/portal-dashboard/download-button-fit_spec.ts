import { downloadButtonFits, outerBox, MIN_DOWNLOAD_BUTTON_GAP } from "../../../js/components/portal-dashboard/download-button-fit";

describe("download button fit", () => {
  const buttonOuterWidth = 190;
  const ownerOuterLeft = 1000;

  describe("downloadButtonFits", () => {
    it("fits while shown when the button clears the Assignment selector by the minimum gap", () => {
      const shown = { assignmentRight: 700, ownerOuterLeft, buttonOuterWidth, buttonShown: true };
      expect(downloadButtonFits({ ...shown, buttonOuterLeft: 700 + MIN_DOWNLOAD_BUTTON_GAP })).toBe(true);
      expect(downloadButtonFits({ ...shown, buttonOuterLeft: 700 + MIN_DOWNLOAD_BUTTON_GAP - 1 })).toBe(false);
    });

    it("fits while hidden when the gap in front of the name could hold it", () => {
      const assignmentRight = ownerOuterLeft - buttonOuterWidth - MIN_DOWNLOAD_BUTTON_GAP;
      const hidden = { ownerOuterLeft, buttonOuterWidth, buttonShown: false, buttonOuterLeft: 0 };
      expect(downloadButtonFits({ ...hidden, assignmentRight })).toBe(true);
      expect(downloadButtonFits({ ...hidden, assignmentRight: assignmentRight + 1 })).toBe(false);
    });

    it("gives the same answer shown and hidden, so the button can't flip back and forth", () => {
      // With the name at its natural width and packed to the right, a shown button ends where the name starts.
      const buttonOuterLeft = ownerOuterLeft - buttonOuterWidth;
      for (let assignmentRight = 700; assignmentRight <= 900; assignmentRight++) {
        const common = { assignmentRight, ownerOuterLeft, buttonOuterWidth, buttonOuterLeft };
        expect(downloadButtonFits({ ...common, buttonShown: true }))
          .toBe(downloadButtonFits({ ...common, buttonShown: false }));
      }
    });
  });

  describe("outerBox", () => {
    it("includes the element's horizontal margins", () => {
      const el = document.createElement("div");
      el.style.marginLeft = "12px";
      el.style.marginRight = "8px";
      document.body.appendChild(el);
      el.getBoundingClientRect = () => ({ left: 100, right: 250, width: 150 } as DOMRect);
      expect(outerBox(el)).toEqual({ left: 88, right: 258, width: 170 });
      el.remove();
    });
  });
});
