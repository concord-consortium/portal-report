import semver from "semver";

function setVersionNumber(rubric, versionString) {
  rubric.version = versionString;
}

function expandNonApplicableRatings(rubric) {
  const {ratings, criteria} = rubric;
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
];

function runMigration(rubric, migration) {
  // tslint:disable-next-line:no-console
  console.log(`migrating rubric to ${migration.version}`);
  setVersionNumber(rubric, migration.version);
  for (migration of migration.migrations) {
    migration(rubric);
  }
  return rubric;
}

function skipMigration(migration) {
  // tslint:disable-next-line:no-console
  console.log(`skipping migration: ${migration.version}`);
}

export const LastVersion = migrations[migrations.length - 1].version;

export default function migrate(rubric) {
  rubric.reportVersion = rubric.reportVersion ? rubric.reportVersion : "0.0.0";

  for (var m of migrations) {
    if (semver.gte(rubric.reportVersion, m.version)) {
      skipMigration(m);
    } else {
      runMigration(rubric, m);
    }
  }
  return rubric;
}
