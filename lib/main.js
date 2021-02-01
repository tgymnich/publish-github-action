"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const Github = require('@actions/github');
const { Octokit } = require("@octokit/rest");
const { retry } = require("@octokit/plugin-retry");
const fs = require('fs');
const semver = require('semver');
const githubToken = core.getInput('github_token', { required: true });
const context = Github.context;
const MyOctokit = Octokit.plugin(retry);
const octokit = new MyOctokit({
    auth: githubToken,
    request: {
        retries: 4,
        retryAfter: 60,
    },
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            let version = 'v' + json.version;
            let minorVersion = 'v' + semver.major(json.version) + '.' + semver.minor(json.version);
            let majorVersion = 'v' + semver.major(json.version);
            let branchName = 'releases/' + version;
            let tags = yield octokit.repos.listTags({ owner: context.repo.owner, repo: context.repo.repo });
            if (tags.data.some(tag => tag.name === version)) {
                console.log('Tag', version, 'already exists');
                return;
            }
            yield exec.exec('git', ['checkout', '-b', branchName]);
            yield exec.exec('npm install --production');
            yield exec.exec('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
            yield exec.exec('git config --global user.name "github-actions[bot]"');
            yield exec.exec('git remote set-url origin https://x-access-token:' + githubToken + '@github.com/' + context.repo.owner + '/' + context.repo.repo + '.git');
            yield exec.exec('git add -f node_modules');
            yield exec.exec('git rm -r .github');
            yield exec.exec('git commit -a -m "prod dependencies"');
            yield exec.exec('git', ['push', 'origin', branchName]);
            yield exec.exec('git', ['push', 'origin', ':refs/tags/' + version]);
            yield exec.exec('git', ['tag', '-fa', version, '-m', version]);
            yield exec.exec('git', ['push', 'origin', ':refs/tags/' + minorVersion]);
            yield exec.exec('git', ['tag', '-f', minorVersion]);
            yield exec.exec('git', ['push', 'origin', ':refs/tags/' + majorVersion]);
            yield exec.exec('git', ['tag', '-f', majorVersion]);
            yield exec.exec('git push --tags origin');
            yield octokit.repos.createRelease({ owner: context.repo.owner, repo: context.repo.repo, tag_name: version, name: version });
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
