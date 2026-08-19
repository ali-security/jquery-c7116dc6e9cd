#!/bin/bash
# Drives the QUnit suite in headless Chrome. The build itself runs on the
# release-era node 0.10; puppeteer needs a modern runtime, so it is installed
# into its own directory and loaded via NODE_PATH, leaving the project's
# node_modules (resolved against the release-date registry) untouched.
set -e

REPO="$( cd "$( dirname "$0" )/../.." && pwd )"
RUNNER_DIR=/tmp/puppeteer-runner

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
node --version

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"
npm init -y --registry=https://registry.npmjs.org/
npm install --registry=https://registry.npmjs.org/ puppeteer@23.11.1

cd "$REPO"
NODE_PATH="$RUNNER_DIR/node_modules" node test/libs/browser-runner.js "$1"
