const params = new URLSearchParams(window.location.search);

export const disableRubric = params.get("debug:disableRubric") === "true";

export const rubricSummaryTableOverride = params.get("debug:rubricSummaryTableOverride");

export const rubricUrlOverride = params.get("debug:rubricUrlOverride");
