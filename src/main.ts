import * as core from '@actions/core';
import * as exec from '@actions/exec';
const Github = require('@actions/github');
const githubToken = core.getInput('github_token', { required: true });
const context = Github.context;
const fs = require('fs');

async function run() {
  try {
    let json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    let version = json.version;
    let branchName: string = 'releases/v'+version;

    await exec.exec('git', ['checkout', '-b', branchName]);
    await exec.exec('npm install --production');
    await exec.exec('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
    await exec.exec('git config --global user.name "github-actions[bot]"');
    await exec.exec('git remote set-url origin https://x-access-token:'+githubToken+'@github.com/'+context.repo.owner+'/'+context.repo.repo+'.git');
    await exec.exec('git add -f node_modules');
    await exec.exec('git commit -a -m "prod dependencies"');
    await exec.exec('git', ['push', 'origin', branchName]);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
