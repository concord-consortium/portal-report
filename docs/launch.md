The portal report can run in multiple different modes depending on which URL params are passed to it.

## Modes

### Views
- Classic Report
- Dashboard
- Portal Dashboard

### Data
- Fake Data
- Legacy Portal Data (not sure if this is still supported)
- Report Service Data

### Authentication
- Anonymous Fake Data
- Launched from Portal with short-lived token
- Launched from third party site with anonymous run key
- Launched from third party site and authenticate user

## Details

### Launched from third party site and authenticate user

![Thirdparty authed launch](diagrams/thirdparty-authed-launch.mmd.svg)

In this diagram the Activity Player could be substituted for another third party site. For example we plan to use this kind of launch from spreadsheets generated for researchers.

1. Params passed by third party to the portal-report
    - **class** URL to portal class api to get info about the class
    - **classOfferings** URL to portal offering api using a class_id filter **TODO** why do we have this???
    - **firebase-app** firebase app name in the portal. It defaults to "report-service". You might set this to work ith the development firestore database with "report-service-dev"
    - **offering** URL used to request info from the portal about this assignment in the portal
    - **activityUrl** URL to the authored activity typically this would be something like
    `https://authoring.concord.org/activities/1234`
    - **reportType** always set to `offering`
    - **studentId** user id of the student this report is being opened for
    - **tool-id** URI for tool that stored the resource structure in the report service. For the activity player this will often be `https://authoring.concord.org`
    - **auth-domain** URL for the authentication domain, usually the portal so it would usually be `https://learn.concord.org`

### Using data

Data is fetched using `api.js`.

If the query parameters of the url do not include values for `offering` and `class`, we will load in fake data from
the `js/data` folder. This data gets loaded in much the same way as real data, so can be used for testing.

If we do have `offering` and `class` parameters, then `api.js` will first attempt to get the data for the offering and
class from the portal. To do this it also needs a `token` parameter, which is used to authenticate with the portal and
expires after one hour. Besides the class and offering data, we will also fetch a firestore JWT from the portal, given
the classHash (from the fetched class data) and the token. Using this JWT, we can authenticate with Firestore. Once we
have successfully authenticated, `receivePortalData` is called in `index.ts`, which starts watching the sequence
structure and answer data.

To test the portal using real data, the easiest way is simply to open a report as a teacher from the portal, and then
replace the url host and path with `localhost:8080`. Alternatively, if you are able to edit the portal settings for the
offering, you can add the "Developers Tracked Questions (Local)" report to the External Reports of the offering, and
when you view the class details, you will see a "Local Tracked Q" button next to "Report" which will link to localhost.

### URL Parameters

* `token={string}`: access token provided by the portal when it launches the report. It is used as a Bearer
                    token when making requests to the portal
* `class={url}`:    URL to get info about the class from the portal
* `offering={url}`: URL to get info about the offering from the portal
* `firebase-app={name}`: identifier for a portal Firebase App. This name is sent to the portal to get a FirebaseJWT.
                    It defaults to "report-service".
* `tool-id={uri}`:  URI identifying the tool that stored the activity structure and answers in Firestore. The `tool-id`
                    is converted to a source key, which is used to query the activity structure and answers in firestore.
                    The conversion from `tool-id` to source key matches the `make_source_key` method in LARA's
                    report_service.rb. If the `tool-id` is not set then the source key is the hostname of the
                    activity_url of the offering data retrieved from the portal.
* `portal-dashboard`: boolean parameter which tells the report to render in a new dashboard style
* `dashboard`:      boolean parameter which tells the report to render in old dashboard style
* `activityIndex={index}`: when the activity is a sequence, only show this activity's questions
* `studentId={id}`: This shows the report for a single student, and removes some UI affordances. The filtering of the
                    student data happens client-side.
* `iframeQuestionId={id}`: This, combined with a valid `studentId`, will show a stand-alone, full-size iframe containing
                    the model referenced by `iframeQuestionId`, and the answer saved by `studentId` (either as state or as
                    a url).

Parameters for showing data stored anonymously in the report service

* `runKey={string}`: identifier for anonymous answers stored in the report service. The activity player generates a
                    a runkey when launched anonymously. The activity player then sends this runKey to the portal report
                    when the user clicks the report button in the activity player.
* `activity={uri}`: portal-report uses this uri to find the activity structure in the report service firestore database
                    this uri is also parsed to make the source key for the activity structure similar to the `tool-id`
                    above. It is important to note that the `tool-id` is ignored in this case. If the activity is not specified,
                    fake activity structure will be used.
* `answerSource={string}`: identifier used to construct the path to the answers in the report service. In the case of
                    the activity player the answerSource is activity-player.concord.org.

Parameters for 3rd party launching

* `auth-domain={url}`: root URL for the portal which can authenticate the current user. This parameter can be
                    used instead of the `token` param. The portal report will do an OAuth2 request to the auth-domain
                    in order to get an access-token.

Parameters to help with running local tests

* `enableFirestorePersistence=true`: Uses a local firestore DB for data persistance across sessions and tabs. Clear the
                    DB by going to `dev tools > Application > IndexedDB > firebaseLocalStorageDb > Delete database`
* `clearFirestorePersistence=true`: Clears local firestore DB. If this and `enableFirestorePersistence=true` are set
                    then the DB will be cleared first before the local persistence is enabled.
