The Portal Report uses the Report Service as its backend. It counts on the an activity runtime to update the data in the Report Service and then it displays this data.

Besides loading the activity structure from the Report Service, it also saves some info:
- user settings in the report service about which questions should be visible in a report, and whether the user wants to anonymous the student names in the report.
- feedback settings about what kind of feedback a teacher wants to give students
- activity and question feedback

## FireStore Paths

The portal-report loads and saves documents in the report-service Firestore database.
LARA also writes data into the report-service.
The Activity Player reads and writes data into the report-service.
The new researcher report system reads data from the report-service.

The following collections make up the report-service:

##### `sources/${source}/resources`
Each document represents an activity or sequence that can be reported on.
Each document lists the reportable questions or items and what pages they are on.
It also includes information about what the correct answer is.

Authoring systems (LARA) writes.
Reporting systems (portal-report researcher-report) read.

##### `sources/${source}/answers`
Each document represents a single answer to a question or item

Runtimes (LARA and AP) write.
Reporting Systems (portal-report researcher-report) read.

##### `sources/${source}/user_settings/${validFsId(platformUserId)}/resource_link/${validFsId(resourceLinkId)}`
Each document represents the settings for a teacher viewing the report. Currently
these settings are which questions should be visible, and whether the user names should be anonymized.
Unlike most other collections the `source` in this case is the platform. In most cases that is
learn.concord.org

Reporting System (portal-report) reads and writes.

##### `sources/${source}/feedback_settings`
Each document has info about the feedback setting for a particular assignment (resourceLink).
There can be a cached version of the rubric.
And for each question there can be `scoreEnabled`, `feedbackEnabled`

Reporting System (portal-report) reads and writes.
Potential: Runtime (LARA and AP) reads: to show feedback status to the student

##### `sources/${source}/question_feedbacks`
Each document is feedback on a specific answer by a student.

Reporting System (portal-report) reads and writes.
Potential: Runtime (LARA and AP) reads: to show feedback content to the student


##### `sources/${source}/activity_feedbacks`
Each document is feedback on the whole activity by a student

Reporting System (portal-report) reads and writes.
Potential: Runtime (LARA and AP) reads: to show feedback content to the student
