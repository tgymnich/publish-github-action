"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const Github = require('@actions/github');
const githubToken = core.getInput('github_token', { required: true });
const context = Github.context;
const fs = require('fs');
const semver = require('semver');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            let version = 'v' + json.version;
            let minorVersion = 'v' + semver.major(json.version) + '.' + semver.minor(json.version);
            let majorVersion = 'v' + semver.major(json.version);
            let branchName = 'releases/' + version;
            yield exec.exec('git', ['checkout', '-b', branchName]);
            yield exec.exec('npm install --production');
            yield exec.exec('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
            yield exec.exec('git config --global user.name "github-actions[bot]"');
            yield exec.exec('git remote set-url origin https://x-access-token:' + githubToken + '@github.com/' + context.repo.owner + '/' + context.repo.repo + '.git');
            yield exec.exec('git add -f node_modules');
            yield exec.exec('git commit -a -m "prod dependencies"');
            yield exec.exec('git', ['push', 'origin', branchName]);
            yield exec.exec('git', ['tag', '-fa', version]);
            yield exec.exec('git', ['tag', '-fa', minorVersion]);
            yield exec.exec('git', ['tag', '-fa', majorVersion]);
            yield exec.exec('git push --tags origin');
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
