import * as core from '@actions/core';
import * as github from '@actions/github';
import { LabelChecker } from './LabelChecker';

async function run(): Promise<void> {
    const requiredLabels = JSON.parse(core.getInput('required_labels')) as string[];
    const anyOfLabels = JSON.parse(core.getInput('any_of_labels')) as string[];
    const githubApi= github.getOctokit(core.getInput('token'));
    const context = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        prNumber: github.context.payload.pull_request?.number!,
        actor: github.context.actor,
        prAuthor: github.context.payload.pull_request?.user.login!,
        branchName: github.context.payload.pull_request?.head.ref!,
    }
    const labelChecker:LabelChecker = new LabelChecker(githubApi, context);
    const labels = await labelChecker.fetchLabelsOnPR();
    core.info(`🔍 Sprawdzam przynajmniej labelki na PR: ${labels}`);
    await labelChecker.verifyRequiredLabels(requiredLabels);

    core.info('test');
}

run();