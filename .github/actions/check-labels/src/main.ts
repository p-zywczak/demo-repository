import * as core from '@actions/core';
import * as github from '@actions/github';
import { LabelChecker } from './LabelChecker';
import { LabelRemover } from './LabelRemover';

async function run(): Promise<void> {
    const requiredLabels = JSON.parse(core.getInput('required_labels')) as string[];
    const anyOfLabels = JSON.parse(core.getInput('any_of_labels')) as string[][];
    const skipLabelsCheck = JSON.parse(core.getInput('skip_labels_check')) as string[];
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
    const labelRemover:LabelRemover = new LabelRemover(githubApi, context);
    const prHasCRLabel:boolean = await labelChecker.hasCRLabel();
    if(prHasCRLabel) {
        const prLabels = await labelChecker.fetchLabelsOnPR();
        if(prLabels.includes('APPROVAL')) {
            await labelRemover.removeLabel('APPROVAL')
        }
    }
    if(await labelChecker.hasBypassSkipLabel(skipLabelsCheck)) {
        core.info('The PR has a label that allows skipping other checks.');
        return;
    }
    await labelChecker.checkSelfLabelAssignment(requiredLabels);
    await labelChecker.verifyRequiredLabels(requiredLabels);
    await labelChecker.verifyAnyOfLabels(anyOfLabels);


    core.info('test');
}

run();