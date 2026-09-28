import { fromJS, Map } from "immutable";
import { downloadDashboardCsv } from "../../js/actions/download-csv";
import { trackEvent } from "../../js/actions/index";

jest.mock("../../js/actions/index", () => ({
  trackEvent: jest.fn((category: string, action: string) => ({ type: "TRACK_EVENT_THUNK", category, action }))
}));

const state = Map({
  report: fromJS({
    clazzName: "Test Class",
    clazzTeacherNames: ["Kristen Teachername"],
    sourceKey: "fake.authoring.system",
    anonymous: false,
    userType: "teacher",
    showFeaturedQuestionsOnly: true,
    students: {
      1: { id: "1", userId: 1, firstName: "John", lastName: "Jenkins", name: "John Jenkins", lastRun: null }
    },
    sequences: { seq: { id: "seq", name: "Report Test Sequence", children: ["activity_1"] } },
    activities: { activity_1: { id: "activity_1", name: "Fires", children: ["section_1"] } },
    sections: { section_1: { id: "section_1", children: ["page_1"] } },
    pages: { page_1: { id: "page_1", children: [] } },
    questions: {},
    answers: {}
  })
}) as any;

// readAsText decodes the text and drops a byte order mark, so the mark is checked in the raw bytes.
const readBlobBytes = (blob: Blob) => new Promise<Uint8Array>(resolve => {
  const reader = new FileReader();
  reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
  reader.readAsArrayBuffer(blob);
});
const readBlobText = (blob: Blob) => new Promise<string>(resolve => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsText(blob);
});

describe("downloadDashboardCsv", () => {
  let blobs: Blob[];
  let clickedLinks: HTMLAnchorElement[];
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    blobs = [];
    clickedLinks = [];
    (URL as any).createObjectURL = jest.fn((blob: Blob) => {
      blobs.push(blob);
      return "blob:csv";
    });
    (URL as any).revokeObjectURL = jest.fn();
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function(this: HTMLAnchorElement) {
      clickedLinks.push(this);
    });
  });

  afterEach(() => {
    clickSpy.mockRestore();
    jest.useRealTimers();
    delete (URL as any).createObjectURL;
    delete (URL as any).revokeObjectURL;
  });

  it("saves the CSV through a temporary link and logs the download", async () => {
    const dispatch = jest.fn();
    downloadDashboardCsv()(dispatch, () => state);

    expect(clickedLinks).toHaveLength(1);
    const [link] = clickedLinks;
    expect(link.download).toMatch(/^Test Class - Report Test Sequence - \d{4}-\d{2}-\d{2}\.csv$/);
    expect(link.getAttribute("href")).toBe("blob:csv");
    expect(document.body.contains(link)).toBe(false);

    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe("text/csv;charset=utf-8");

    expect(trackEvent).toHaveBeenCalledWith("Portal-Dashboard", "DownloadCSV");
    expect(dispatch).toHaveBeenCalledWith({ type: "TRACK_EVENT_THUNK", category: "Portal-Dashboard", action: "DownloadCSV" });

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    jest.advanceTimersByTime(40 * 1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:csv");

    jest.useRealTimers();
    const bytes = await readBlobBytes(blobs[0]);
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xEF, 0xBB, 0xBF]);
    const text = await readBlobText(blobs[0]);
    expect(text.split("\r\n")[0]).toBe(
      "Student Name,Username,Class,Teachers,Assignment,Last Run,Questions,Answered,Progress (%)");
    expect(text).toContain("\r\n\"Jenkins, John\",,Test Class,Kristen Teachername,Report Test Sequence,,0,0,\r\n");
  });
});
