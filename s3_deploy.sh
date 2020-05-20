#!/bin/bash

# this will deploy the current public folder to a subfolder in the s3 bucket
# the subfolder is the name of the TRAVIS_BRANCH
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	echo "skiping deploy to S3: this is a pull request"
	exit 0
fi

rm -rf _site

if [ "$TRAVIS_BRANCH" = "production" ]; then
  mv dist _site
else
  # the 2> is to prevent error messages when no match is found
  CURRENT_TAG=`git describe --tags --exact-match $TRAVIS_COMMIT 2> /dev/null`
  if [ "$TRAVIS_BRANCH" = "$CURRENT_TAG" ]; then
    # this is a tag build
    mkdir -p _site/version
    DEPLOY_DIR=version/$TRAVIS_BRANCH
  else
    # strip PT ID from branch name for branch builds
    DEPLOY_DIR_NAME=$TRAVIS_BRANCH
    PT_PREFIX_REGEX="^([0-9]{8,}-)(.+)$"
    PT_SUFFIX_REGEX="^(.+)(-[0-9]{8,})$"
    if [[ $DEPLOY_DIR_NAME =~ $PT_PREFIX_REGEX ]]; then
      DEPLOY_DIR_NAME=${BASH_REMATCH[2]}
    fi
    if [[ $DEPLOY_DIR_NAME =~ $PT_SUFFIX_REGEX ]]; then
      DEPLOY_DIR_NAME=${BASH_REMATCH[1]}
    fi

    mkdir -p _site/branch
    DEPLOY_DIR=branch/$DEPLOY_DIR_NAME
  fi
  mv dist _site/$DEPLOY_DIR
  export DEPLOY_DIR
fi
s3_website push