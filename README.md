![build-status](https://travis-ci.org/concord-consortium/portal-report.svg?branch=master)

# portal-report

[Portal](https://github.com/concord-consortium/rigse) report for teachers.

Demo: http://concord-consortium.github.io/portal-report/

It expects two URL params: `reportUrl` and `token`. If they are not provided, it will be using fake data, so it's easy to work on some features without connecting to the real Portal instance.

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install -g webpack
npm install
```
Then you can build the project files using:
```
webpack
```
or start webpack dev server:
```
npm install -g webpack-dev-server 
webpack-dev-server
```
and open http://localhost:8080/ or http://localhost:8080/webpack-dev-server/ (auto-reload after each code change).

## Test
There are two scripts defined in `package.json`: `test` and `test:watch`.  These commands can be run from the terminal using the syntax `npm run test` and `npm run test:watch` respectively. The former script run the mocha test suite one time. The latter watches `test/**/*.js?x` files for changes, and runs the given test suite when the file changes.

 These tests were setup using [this tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html#unit-testing-support) as a guide.  They use [mocha](https://mochajs.org/), [chai](http://chaijs.com/api/bdd/), and [react test utils](https://facebook.github.io/react/docs/test-utils.html).

## Deployment

#### Github Pages:
You can build a simple github page deployment by following these steps:
1. prepare the destination directory: `rm -rf ./dist`
1. clone the gh-pages branch to dist: `git clone -b gh-pages git@github.com:concord-consortium/portal-report.git dist`
1. build: `webpack`
1. add the files and commit: `cd dist; git add .; git commit -m "gh-pages build"`
1. push the changes to github: `git push`

#### Travis S3 Deployment:
Travis automatically builds and deploys branches and tags. A simple `git push` initiate a deployment of the current branch to amazon S3. Once completed the build we be available at `http://portal-report.concord.org/branch/<branchname>`.  The production branch deploys to [http://portal-report.concord.org/](http://portal-report.concord.org/branch/master/)

#### Manual S3 Deployment
If you want to do a manual deployment, put your S3 credentials in `.env` and copy `s3_deploy.sh` to a local git-ignored script. Fill in missing ENV vars, and then run that script.


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



## License

[MIT](https://github.com/concord-consortium/grasp-seasons/blob/master/LICENSE)
