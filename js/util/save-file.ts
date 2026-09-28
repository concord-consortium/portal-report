// The download is blocked if this runs inside a sandboxed iframe without allow-downloads.
export const saveTextFile = (fileName: string, text: string, mimeType: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking right away can cancel the download in some browsers; FileSaver.js waits 40 seconds.
  setTimeout(() => URL.revokeObjectURL(url), 40 * 1000);
};
