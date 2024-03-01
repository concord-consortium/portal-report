const params = new URLSearchParams(window.location.search);

export const disableRubric = params.get("debug:disableRubric") === "true";
