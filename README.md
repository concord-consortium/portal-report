![build-status](https://travis-ci.org/concord-consortium/portal-report.svg?branch=master)

# portal-report

[Portal](https://github.com/concord-consortium/rigse) report for teachers.

Demo: http://portal-report.concord.org/version/v3.0.0/

Check recent git tags to open the most recent version.

It expects two URL params: `reportUrl` and `token`. If they are not provided, it will use fake sequence data, so it's easy to work on some features without connecting to the real Portal instance. If URL param `resourceType=activity` is provided, it will use fake activity data.

At this time the portal report data can be presented in report view or in dashboard view. By default the report view is shown. Add the URL parameter `dashboard=true` (or any value other than "false") to show the tabular dashboard view. Add the URL parameter `portal-dashboard=true` (or any value other than "false") to show the updated and redesigned portal dashboard view.

To send events to the log manager add the URL parameter of `logging=true`.  To see what is logged in the console add the URL parameter of `debugLogging=true`.

More details on the available url parameters are in [launch.md](docs/launch.md#url-parameters).

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

Deployments are based on the contents of the /dist folder and are built automatically by GitHub Actions for each branch and tag pushed to GitHub.

Branches are deployed to `https://portal-report.concord.org/branch/<name>/`.

Tags are deployed to `https://portal-report.concord.org/version/<name>/`

You can view the status of all the branch and tag deploys [here](https://github.com/concord-consortium/portal-report/actions).

The production release is available at `https://portal-report.concord.org`.

Production releases are done using a manual GitHub Actions workflow. You specify which tag you want to release to production and the workflow copies that tag's `index-top.html` to `https://portal-report.concord.org/index.html`.

See the CLUE [docs/deploy.md](https://github.com/concord-consortium/collaborative-learning/blob/master/docs/deploy.md) for more details (it uses the same process).

To deploy a production release:

1. Update the version number in `package.json` and `package-lock.json`
    - `npm version --no-git-tag-version [patch|minor|major]`
1. Verify that everything builds correctly
    - `npm run lint && npm run build && npm run test`
1. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
1. Test the master build at: https://portal-report.concord.org/index-master.html
1. Push a version tag to GitHub and/or use https://github.com/concord-consortium/portal-report/releases to create a new GitHub release
1. Stage the release by running the [Release Staging Workflow](https://github.com/concord-consortium/portal-report/actions/workflows/release-staging.yml) and entering the version tag you just pushed.
1. Test the staged release at https://portal-report.concord.org/index-staging.html
1. Update production by running the [Release Workflow](https://github.com/concord-consortium/portal-report/actions/workflows/release-production.yml) and entering the release version tag.


#### Library

S3 deployment will automatically take care of the library deployment to S3 bucket: `http://portal-report.concord.org/version/[some_version_tag]/library/portal-report.js`

However, NPM module needs to be updated manually. First, update version number in `package.json` (follow version number of the app, so the most recent `v...` tag).
Then run:

```
npm publish --access=public
```

NPM will automatically build the library first, as `package.json` defines `script/prepare`.

#### Production Release
To deploy a production release:

1. Merge all changes to `master`.
2. Make a new version tag using your local git client with the version number in the description (e.g., `git tag -a v1.1.1 -m "version 1.1.1"`) and push the tag to the portal-report repo (e.g., `git push origin v1.1.1`).
3. Use https://github.com/concord-consortium/portal-report/releases to create a new release using the newly created tag.
4. Login to https://learn.staging.concord.org/ as an admin and under Admin > Site Admin Links > External Reports update the URL field of any External Reports that use the latest version of portal-report. Change the URL to the newly created release (e.g., https://portal-report.concord.org/version/vx.y.z/).
5. Run any QA and testing on staging release.
6. Once testing is complete, login to https://learn.concord.org/ as an admin and under Admin > Site Admin Links > External Reports update the URL field of any External Reports that use the latest version of portal-report. Change the URL to the newly created release (e.g., https://portal-report.concord.org/version/vx.y.z/).
7. Add the new released portal report version (https://portal-report.concord.org/version/vx.y.z/) to Learn Portal (https://learn.concord.org) as an admin  under Admin > Site Admin Links > Auth Client > Portal Report SPA > Allowed redirect URIs
8. Add the new released portal report version (https://portal-report.concord.org/version/vx.y.z/) to NGSA Portal (https://ngss-assessment.portal.concord.org/) as an admin  under Admin > Site Admin Links > Auth Client > Portal Report SPA > Allowed redirect URIs
9. Run any QA and testing on production release.
10. Since the portal-report is also used in the Activity Player when "Show my work" is used in the AP, a new release of the portal report needs an update of its version in the AP and hence a release too. To do this, follow these steps:
  - #### If you do not have activity player repo locally
  Clone activity player
  ```
  git clone https://github.com/concord-consortium/activity-player.git
  cd activity-player
  ```
  #### If you already have activity player repo locally
  Checkout master and get latest master
  ```
  cd activity-player
  git checkout master
  git pull --rebase
  ```
  - Create a new branch called portal-report-version-update
  ```
  git checkout -b portal-report-version-update
  ```
  - Update the version number of the portal-report on line-12 activity-player/src/utilities/report-utils.ts - https://github.com/concord-consortium/activity-player/blob/master/src/utilities/report-utils.ts#L12

  - Commit and Push the branch
    ```
    git add -u
    git commit -m "Updating portal-report version number that is used in Show My Work"
    git push -u origin portal-report-version-update
    ```
  - Get this branch reviewed and follow the Production Deployment steps in the Activity Player README.md to deploy this to Production.

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

### Development/Debug Query Params

The following query params can be used during development or when debugging issues:

- `debug:disableRubric` - when set to `true` (`?debug:disableRubric=true`) the rubric defined for the offering is not loaded.  This is useful when using the baked in demo data which does have a rubric defined to develope/debug the dashboard behavior when a rubric is not defined.

- `debug:rubricSummaryTableOverride` - overrides the rubric summary table option for the loaded rubric.  Possible values are:
  `none`, `above`, `below`, and `onlySummary`.  Useful for testing the placement of the summary table without having to create multiple rubrics.

- `debug:rubricUrlOverride` - overrides the rubric url specified in the activity json or saved in the offering data.  This can either be one of the built-in rubrics in the `public` folder or a full url.  Example built-in rubrics include: `sample-rubric-no-tags.json`, `sample-rubric-all-dci-na.json`, and `sample-v1-rubric.json`.  Useful for testing rubric features during development.

## License

[MIT](https://github.com/concord-consortium/grasp-seasons/blob/master/LICENSE)
