import * as core from '@actions/core';
import * as github from '@actions/github';
import { ReleaseBranchSynchronizer } from './ReleaseBranchSynchronizer'
async function run(): Promise<void> {
    const githubApi= github.getOctokit(core.getInput('token'));
    const ver = core.getInput('ver', );
    const repoOwner = core.getInput('repo_owner');
    const repoName = core.getInput('repo_name');
    const backend = core.getInput('backend');

    const releaseBranchSynchronizer:ReleaseBranchSynchronizer = new ReleaseBranchSynchronizer(githubApi, ver, repoOwner, repoName);
    if(await releaseBranchSynchronizer.checkReleaseBranchExists()) {
        process.exit(0);
    } else {
        await releaseBranchSynchronizer.createEmptyRelease();
        if(backend === 'true') {
            await releaseBranchSynchronizer.updateVersion();
        }
    }
}

run();