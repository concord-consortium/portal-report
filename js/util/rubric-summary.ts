import { ICriteriaCount } from "../components/portal-dashboard/feedback/rubric-summary-icon";
import { Rubric, RubricRating } from "../components/portal-dashboard/feedback/rubric-utils";

export interface IRubricSummaryRowRating {
  score: number;
  label: string;
  percentage: number;
  isApplicableRating: boolean;
}

export interface IRubricSummaryRow {
  text: string;
  ratings: IRubricSummaryRowRating[];
  iconUrl?: string;
  iconPhrase?: string;
  criteriaGroupIndex?: number;
}

export interface IRubricSummary {
  tableRows: IRubricSummaryRow[];
  tagSummaryRows: IRubricSummaryRow[];
  tagSummaryTitle: string;
}

const getRubricSummaryRowRatings = (rows: IRubricSummaryRow[], ratings: RubricRating[]) => {
  const summaryRowRatings: IRubricSummaryRowRating[] = [];

  ratings.forEach(({score, label}, index) => {
    const {sum, count, hasApplicableRating} = rows.reduce((acc, row) => {
      const {isApplicableRating, percentage} = row.ratings[index];
      acc.count++;
      if (isApplicableRating) {
        acc.sum += percentage;
        acc.hasApplicableRating = true;
      }
      return acc;
    }, {sum: 0, count: 0, hasApplicableRating: false});
    if (count > 0 && hasApplicableRating) {
      summaryRowRatings.push({isApplicableRating: true, percentage: Math.round(sum / count), score, label});
    } else {
      summaryRowRatings.push({isApplicableRating: false, percentage: 0, score, label});
    }
  });

  return summaryRowRatings;
};

export const getRubricSummary = (rubric: Rubric, criteriaCounts: ICriteriaCount[]): IRubricSummary => {
  const {criteriaGroups, ratings} = rubric;
  const tableRows: IRubricSummaryRow[] = [];
  const tagSummaryRows: IRubricSummaryRow[] = [];
  const tags = new Map<string, string>();

  criteriaGroups.forEach((criteriaGroup, criteriaGroupIndex) => {
    criteriaGroup.criteria.forEach(criterion => {
      const {iconUrl, iconPhrase} = criterion;
      const row: IRubricSummaryRow = {criteriaGroupIndex, ratings: [], iconUrl, iconPhrase, text: criterion.description};
      ratings.forEach(rating => {
        const {id, score} = rating;
        const isApplicableRating = criterion.nonApplicableRatings === undefined || criterion.nonApplicableRatings.indexOf(id) < 0;
        const label = isApplicableRating ? criterion.ratingDescriptions?.[id] : "Not Applicable";
        let percentage = 0;
        if (isApplicableRating) {
          const criteriaCount = criteriaCounts.find(cc => cc.id === criterion.id);
          if (criteriaCount && criteriaCount?.numStudents > 0) {
            const ratingCount = criteriaCount.ratings[id];
            if (ratingCount) {
              percentage = Math.round((ratingCount / criteriaCount.numStudents) * 100);
            }
          }
        }
        row.ratings.push({score, percentage, label, isApplicableRating});
      });
      tableRows.push(row);

      if (iconUrl && !tags.has(iconUrl) && iconPhrase) {
        tags.set(iconUrl, iconPhrase);
      }
    });
  });

  const hasTags = tags.size > 0;
  const tagSummaryTitle = hasTags ? "Average Result by Tag" : "Summary of Rubric Score";

  if (hasTags) {
    const sortedKeys = Array.from(tags.keys()).sort();
    sortedKeys.forEach(iconUrl => {
      const tagRows = tableRows.filter(r => r.iconUrl === iconUrl);
      const iconPhrase = tags.get(iconUrl) ?? "";
      tagSummaryRows.push({text: iconPhrase, ratings: getRubricSummaryRowRatings(tagRows, ratings), iconUrl, iconPhrase});
    });
    const nonTagRows = tableRows.filter(r => !r.iconUrl);
    if (nonTagRows.length > 0) {
      tagSummaryRows.push({text: "No tag applied", ratings: getRubricSummaryRowRatings(nonTagRows, ratings)});
    }
  } else {
    tagSummaryRows.push({text: "Class Results", ratings: getRubricSummaryRowRatings(tableRows, ratings)});
  }

  return {tableRows, tagSummaryRows, tagSummaryTitle};
};
