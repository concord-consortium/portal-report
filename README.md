![build-status](https://travis-ci.org/concord-consortium/portal-report.svg?branch=master)

# portal-report

[Portal](https://github.com/concord-consortium/rigse) report for teachers.

Demo: http://portal-report.concord.org/version/v3.0.0/

Check recent git tags to open the most recent version.

It expects two URL params: `reportUrl` and `token`. If they are not provided, it will use fake data, so it's easy to work on some features without connecting to the real Portal instance.

At this time the portal report data can be presented in report view or in dashboard view. By default the report view is shown. Add the URL parameter `dashboard=true` (or any value other than "false") to show the tabular dashboard view. Add the URL parameter `portal-dashboard=true` (or any value other than "false") to show the updated and redesigned portal dashboard view.

## Library

Portal Report is a standalone application, but it also provides some React components that can be used by other projects
(https://github.com/concord-consortium/portal-pages). Check the `js/library.js` entry point to see what's available or
to add more components.

There are two ways to use this library:
- NPM module: `@concord-consortium/portal-report`
- Using script tag referencing `http://portal-report.concord.org/version/v3.0.0/library/portal-report.js` (in this case,
  library will be available under global `PortalReport` name)

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install
```
Then you can build the project files using:
```
npm run build
```
or start webpack dev server:
```
npm start
```
and open http://localhost:8080/ or http://localhost:8080/webpack-dev-server/ (auto-reload after each code change).

As of 2020 TypeScript is supported and future development is expected to be in TypeScript. ESLint is used for linting as TSLint is deprecated. Use `npm run lint` to lint the source files and `npm run lint:fix` to auto-fix any fixable lint issues.

## Testing
There are two test scripts defined in `package.json`: `test` and `test:watch`.  These commands can be run from the terminal using the syntax `npm run test` and `npm run test:watch` respectively. The former script runs the jest test suite a single time. The latter watches `test/**/*.[jt]s?x` files for changes, and runs the given test suite when the file changes.

The tests use [Jest](https://jestjs.io/), [ts-jest](https://github.com/kulshekhar/ts-jest), [Enzyme](https://enzymejs.github.io/enzyme/), and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

Integration (Cypress) tests can be run from the command line with `npm run cypress:test`.

## Deployment

#### Github Pages:
You can build a simple github page deployment by following these steps:
1. prepare the destination directory: `rm -rf ./dist`
1. clone the gh-pages branch to dist: `git clone -b gh-pages git@github.com:concord-consortium/portal-report.git dist`
1. build: `webpack`
1. add the files and commit: `cd dist; git add .; git commit -m "gh-pages build"`
1. push the changes to github: `git push`

#### Travis S3 Deployment:
Travis automatically builds and deploys branches and tags. A simple `git push` initiates a deployment of the current branch to amazon S3. Once completed the build will be available at `http://portal-report.concord.org/branch/<branchname>/`.  The production branch deploys to [http://portal-report.concord.org/](http://portal-report.concord.org/)

#### Manual S3 Deployment
If you want to do a manual deployment, put your S3 credentials in `.env` and copy `s3_deploy.sh` to a local git-ignored script. Fill in missing ENV vars, and then run that script.

#### Library

S3 deployment will automatically take care of the library deployment to S3 bucket: `http://portal-report.concord.org/version/[some_version_tag]/library/portal-report.js`

However, NPM module needs to be updated manually. First, update version number in `package.json` (follow version number of the app, so the most recent `v...` tag).
Then run:

```
npm publish --access=public
```

NPM will automatically build the library first, as `package.json` defines `script/prepare`.

### Frameworks, conventions

This app is built using [React](https://facebook.github.io/react/), [Redux](http://redux.js.org/) and [ImmutableJS](https://facebook.github.io/immutable-js/). If you are not familiar with one of these, take a look at [this great tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html). It also uses lots of ES6 syntax, so it might be good to review it first. Semicolons are discussable, but I've decided to follow Redux examples style.

Some things that may be confusing when you start working with Redux (or at least they had been confusing for me):

* Should I create component or container? [A good article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.5h6qk3ac0) and the most important part:

> When you notice that some components don’t use the props they receive but merely forward them down and you have to rewire all those intermediate components any time the children need more data, it’s a good time to introduce some container components. This way you can get the data and the behavior props to the leaf components without burdening the unrelated components in the middle of the tree.

* Is it okay to still use React's state? I think so, and so does [Redux's author](https://github.com/reactjs/redux/issues/1287).

Additional, useful resources:
* [Redux examples](https://github.com/reactjs/redux/tree/master/examples)
* [normalizr](https://github.com/gaearon/normalizr) transforms JSON data from Portal (flattens structure and groups objects by IDs)

### CSS styles

* Browser specific prefixes are not necessary, as this project uses [autoprefixer](https://github.com/postcss/autoprefixer), which will add them automatically.
* Webpack parses URLs in CSS too, so it will either copy resources automatically to `/dist` or inline them in CSS file. That applies to images and fonts (take a look at webpack config).
* All the styles are included by related components in JS files. Please make sure that those styles are scoped to the top-level component class, so we don't pollute the whole page. It's not very important right now, but might become important if this page becomes part of the larger UI. And I believe it's a good practice anyway.
* I would try to make sure that each component specifies all its necessary styles to look reasonably good and it doesn't depend on styles defined somewhere else (e.g. in parent components). Parent components or global styles could be used to theme components, but they should work just fine without them too.
* When you modify the component style, please check how it looks while printed.

Note that conventions in the dashboard part of the code base are somewhat different than in the report part.

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
* `firebase-app={name}`: identifier for a portal Firebase App. This name is send to the portal to get a FirebaseJWT.
                    It defaults to "report-service".
* `tool-id={uri}`:  URI identifying the tool that stored the answers in Firestore. The tool-id is converted to a
                    source key, which is used to query the answers in firestore. The conversion from tool-id to
                    source key matches the make_source_key method in LARA's report_service.rb
* `portal-dashboard`: boolean parameter which tells the report to render in a new dashboard style
* `dashboard`:      boolean parameter which tells the report to render in old dashboard style
* `activityIndex={index}`: when the activity is a sequence, only show this activities questions
* `studentId={id}`: This shows the report for a single student, and removes some UI affordances. The filtering of the
                    student data happens client-side.
* `iframeQuestionId={id}`: This, combined with a valid `studentId`, will show a stand-alone, full-size iframe containing
                    the model referenced by iframeQuestionId, and the answer saved by studentId (either as state or as
                    a url).

Parameters for showing data stored anonymously in the report service

* `runKey={string}`: identifier for anonymous answers stored in the report service. The activity player generates a
                    a runkey when launched anonymously. The activity player then sends this runKey to the portal report
                    when the user clicks the report button in the activity player.
* `activity={uri}`: portal-report uses this uri to find the activity structure in the report service firestore database
                    this uri is also parsed to make the source key for the activity structure similar to the tool-id
                    above.
* `answerSource={string}`: identifier used to construct the path to the answers in the report service. In the case of
                    the activity player the answerSource is activity-player.concord.org.

Parameters for 3rd party launching (still in a un-merged branch)

* `auth-domain={url}`: root URL for the portal which can authenticate the current user. This parameter can be
                    used instead of the `token` param. The portal report will do an OAuth2 request to the auth-domain
                    in order to get an access-token.

Parameters to help with running local tests

* `enableFirestorePersistence=true`: Uses a local firestore DB for data persistance across sessions and tabs. Clear the
                    DB by going to `dev tools > Application > IndexedDB > firebaseLocalStorageDb > Delete database`
* `clearFirestorePersistence=true`: Clears local firestore DB. If this and `enableFirestorePersistence=true` are set
                    then the DB will cleared first before the local persistence is enabled.

## License

[MIT](https://github.com/concord-consortium/grasp-seasons/blob/master/LICENSE)
