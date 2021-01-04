# Source Key

In the report service database the data is segmented in to 'sources'. Each source has a 'sourceKey'.

They were original intended to segment the data stored in the report-service. This way tools working with the report-service wouldn't accidentally clobber some other tool's data. However, we are now sharing this data between multiple tools, so they aren't as useful as they used to be.

## Shared Source Keys

### answers
The LARA Runtime, AP, portal-report, and Athena researcher report, all need to look at the same answers.
The LARA Runtime and AP write these answers. The portal-report and Athena researcher report read these answers.

For testing purposes it would also be useful for the portal-report to write these answers.

The sourceKeys for production answers are:
- `activity-player.concord.org`: this is where the AP writes answers
- `authoring.concord.org`: this is where LARA writes answers

Note:
The activity-player can be configured to read and write answers to the `authoring.concord.org` for testing a migration path. This is done using the activity player's `report-source` url parameter.

### question_feedbacks and activity_feedbacks
Currently only the portal-report reads and writes the feedback documents.
It is likely the AP will start to look at the feedback so it can show it to the students when they are running the activity.

The sourceKey for production feedback documents is:
- `authoring.concord.org`: this is where the portal-report writes

### resources
These documents represent the activity or sequence structure that the portal-report and Athena report are reporting on. The structure includes the activity title, pages, questions, and question prompts.
Currently only LARA writes resource documents. The portal-report and the Athena report read these documents.

The sourceKey for production resource documents is:
- `authoring.concord.org`

## Read or Write
A key part is the write and read or directionality of the data in the various sources.  This read and write stuff also applies to permissions. Ideally the permissions should prevent the other apps and users from writing to documents which they only should read.

Currently the access rules in the report service do not prevent apps from writing to documents. If the current user has access to write to a document in one app, then they have access to write in any app. That might not be something worth fixing.

## New collections
Soon the AP is going to start saving the page the student is currently on. I think it would be best if that was saved in a run specific document in a new collection. Following the pattern of the answer documents, then it should have a sourceKey of `activity-player.concord.org`. These run documents would be indexed by run_key or by resourceLinkId+userId. They could contain additional info besides the current page:
- the resourceUrl
- the offeringUrl
That'd make it easier for some reports to be launched without needing as many parameters as they currently do.

### Details about `tool_id` in the answers documents
It is always added by the AP with a value of `portalData.toolId`. And this is the activity-player URL including its path so it would include the version or branch info if that was used. So this tool_id value works well for identifying which tool actually wrote the answer regardless of which source it is under.

LARA also always adds this to the answers. Its value is either the REPORT_SERVICE_TOOL_ID if it is set or REPORT_SERVICE_SELF_URL otherwise.  The REPORT_SERVICE_SELF_URL is required to be set. The REPORT_SERVICE_TOOL_ID is optional and normally used in the dev environment.  

Typically the tool_id in the answers will be authoring.concord.org.

## Design Guidelines
Deciding what sourceKey to use a for a new type of document is not easy because there isn't a consistent set of rules. So the best option with the current implementation is to look at the other sourceKeys and use your best judgment.

### sourceKey is sort of the domain of application writing data
If we say the source should be the domain of the application that writes the data, here is a analysis of the current code through that filter:

#### Correct
- `resources` only LARA writes here so it should be authoring.concord.org and it is.
- `answers` it is `activity-player.concord.org` when the AP writes answers and `authoring.concord.org` when LARA write answers.

#### Incorrect
- `user_settings` is written by portal-report.concord.org, but the sourceKey is `learn.concord.org`
- `feedback_settings` is written by portal-report but the sourceKey is `authoring.concord.org`
- `question_feedbacks` is written by portal-report but the sourceKey is `authoring.concord.org`
- `activity_feedbacks` is written by portal-report but the sourceKey is `authoring.concord.org`

### sourceKey is sort of the domain of resource the document is related to
In this case the sourceKey is the domain that the documents are related too. So if a document is about a user and the user is authenticated in the portal then the sourceKey would be portal domain. Or if the document is feedback about an activity and the activity is coming from authoring.concord.org then the feedback document should also have a sourceKey of authoring.concord.org.

A rationale for this design goal is that the ids of the documents could then be relative to the resource they are related to. So then the document ids do not need to be globally unique and there is a no chance of conflicts.

Looking at the current code though this filter:

#### Correct
- `user_settings` is written by portal-report.concord.org, but the user the document is for is a user id from learn.concord.org. So the sourceKey is `learn.concord.org`.
- `resources` only LARA writes here and the related resource is the activity or sequence in LARA. So the source key is `authoring.concord.org`.
- `answers` the runtime writes here and the related resource is the student work. For LARA this student work is stored in LARA's database. For the activity-player the student work is completely stored in the report-service. So the sourceKey is `authoring.concord.org` when LARA write answers. And it is `activity-player.concord.org` when the AP writes answers.

#### Ambiguous
- `question_feedbacks` is written by portal-report, but the documents are related to the answer created by the runtime (either activity player or LARA), the question created by LARA, and the assignment in the portal. The related resources can all be discovered from the answer, so we could say the source key should be the domain of the runtime which generated the answers. Currently the sourceKey is `authoring.concord.org`, which is correct for the LARA runtime but incorrect for the activity player runtime.
- `activity_feedbacks` is written by portal-report, but the documents are related to the student's work on the assignment. Currently this association is stored using the portal's contextId for the assignment and portalStudentId. The actual work is really from the runtime, but there is not yet any document saved by the runtime representing the student's work. When the activity player saves the student's current page, then there will be a document for this work. Assuming we move towards this document of student work, then the related resource is the domain of the runtime which generated the work. Currently the sourceKey is `authoring.concord.org`, which is correct for the LARA runtime but incorrect for the activity player runtime.

#### Incorrect
- `feedback_settings` is written by portal-report, but the settings are specific to an assignment in the portal. The sourceKey is `authoring.concord.org`. This is incorrect with this design goal, it should be `learn.concord.org`.

## Possible Improvement: Replace sourceKey with rootKey
Here is an idea to improve the ambiguous use of sourceKeys above.

A single rootKey would be shared by AP, portal-report, LARA, and researcher report.
The rootKey would default to something like 'production', but could be overridden for staging
and development testing.

All data would have to change. AP, portal-report, LARA, and researcher report would need to support this new approach, and ideally also be backward compatible with old approach so we can do the migration easily.

### What about the access rules?
The source is not currently checked by any of the access rules.

### What about conflicting documents?  
If we don't use the source then the activity-player and LARA answer documents will be mixed in the same folder.

The answer documents currently include a `tool_id`. In the AP this domain plus the path of the url of the running the activity player so it also includes the version or branch in. LARA always adds this to the answers, and it typically should be `https://authoring.concord.org` or a developer might set it to something else for testing purposes.

So this is a way to differentiate between the two types of answer documents.

The question_id in the answer documents is not globally unique by itself, but combining it with the resource_url should uniquely identify the question from the authored content. The same question might be shared by some LARA and AP answers, so a search of answers using just `question_id` and `resource_url` could turn up some answer documents from both systems. However, any reporting system should also be using a `resource_link_id` and/or `run_key` these fields should constrain the answers to a single system.  There are cases that come up with migration where some answers from both systems might share a `resource_link_id`, but that is intentional in the case of a migration.

Perhaps a researcher wants to look at answers to a question across many classes. In that case the query would be:
`resource_url = https://example.com and question_id = 234`
That could then pick up answers from different systems. That is hopefully what the researcher would want because it indicates the same question was given in multiple systems. If a researcher wants to limit the search to just answers created by a particular runtime they'd need to include the `tool_id` in the query.

## What about local development?
Currently the portal-report source is determined from the activityUrl from the offering when there is a logged in user.
1. So if a developer uses their localhost instance to load in data from a production activity, their localhost will be writing at least feedback documents into the production database.
2. With the activity player, it currently figures out the answer source from its own URL. So that means the answers will go into the localhost source.

The current approach with the portal-report is not good, but it is kind of necessary in order to be able to test feedback from a production class.
The current approach with the activity player is pretty good it keeps data separated. It still could lead to conflicts between local developers, so it would be better if they overwrote this source. Or we configured webpack to automatically figure out their username and overwrite it.

If the activity player used the domain of the activity file as its sourceKey then a developer running it locally with a remote activity could clobber some production answers. However the toolId stored in the answer would include localhost and unless it was launched from the portal it would not have a matching resourceLinkId.

## What about ease of Firestore UI usage?
The source keys can make it easier to look at answer documents from one system or the other. And because the UI doesn't support searching by multiple properties at once if we always had to include a `tool_id` filter to only look at LARA or only look at Activity Player, then we can't easily filter by anything else.

I think in most cases the filter would be based on properties that should be unique to one system or the other. I can certainly see this leading to problems. But I think these issues are less important that cleaning up the various apps so the sourceKey stuff is less confusing.
