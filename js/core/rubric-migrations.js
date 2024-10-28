import semver from "semver";
import {rubricSummaryTableOverride} from "../util/debug-flags";

function getSummaryTableOverride(currentValue) {
  return rubricSummaryTableOverride ?? currentValue;
}

function setVersionNumber(rubric, versionString) {
  rubric.version = versionString;
}

function expandNonApplicableRatings(rubric) {
  let {criteria} = rubric;
  const {ratings, criteriaGroups} = rubric;

  if (criteriaGroups) {
    criteria = criteriaGroups.reduce((acc, cur) => {
      return acc.concat(cur.criteria);
    }, []);
  }

  criteria.forEach(c => {
    c.nonApplicableRatings = c.nonApplicableRatings
      ? c.nonApplicableRatings
      : [];
    const oldNonApplicable = c.nonApplicableRatings.slice();
    c.nonApplicableRatings = ratings.map(r => {
      if (oldNonApplicable.indexOf(r.id) > -1) {
        return r.id;
      }
      return "";
    });
  });
}

function createCriteriaGroups(rubric) {
  const {criteria, criteriaGroups} = rubric;

  if (criteriaGroups) {
    return;
  }

  rubric.criteriaGroups = [{
    label: "",
    labelForStudent: "",
    criteria
  }];

  criteria.forEach(c => {
    c.iconUrl = "";
  });

  rubric.hideRubricFromStudentsInStudentReport = false;

  delete rubric.criteria;
  delete rubric.referenceURL;
  delete rubric.scoreUsingPoints;
}

const migrations = [
  { version: "1.0.0",
    migrations: [],
  },
  {
    version: "1.1.0",
    migrations: [
      expandNonApplicableRatings,
    ],
  },
  {
    version: "1.2.0",
    migrations: [
      createCriteriaGroups,
    ],
  },
];

function runMigration(rubric, migration) {
  // eslint-disable-next-line no-console
  console.log(`migrating rubric to ${migration.version}`);
  setVersionNumber(rubric, migration.version);
  for (migration of migration.migrations) {
    migration(rubric);
  }
  return rubric;
}

function skipMigration(migration) {
  // eslint-disable-next-line no-console
  console.log(`skipping migration: ${migration.version}`);
}

export const LastVersion = migrations[migrations.length - 1].version;

export default function migrate(rubric) {
  rubric.reportVersion = rubric.reportVersion ? rubric.reportVersion : "0.0.0";

  for (const m of migrations) {
    if (semver.gte(rubric.reportVersion, m.version)) {
      skipMigration(m);
    } else {
      runMigration(rubric, m);
    }
  }

  // the iconPhrase was added in version 1.2.0 without a version bump
  rubric.criteriaGroups.forEach(criteriaGroup => {
    criteriaGroup.criteria.forEach(criteria => {
      criteria.iconPhrase = criteria.iconPhrase ?? "";
    });
  });

  // allow the user to set the summary table option via a query parameter
  rubric.tagSummaryDisplay = getSummaryTableOverride(rubric.tagSummaryDisplay) ?? "none";

  return rubric;
}
