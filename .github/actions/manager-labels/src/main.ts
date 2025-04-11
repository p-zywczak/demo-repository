import * as core from '@actions/core';
import * as github from '@actions/github';
import { LabelChecker } from './LabelChecker';
import { LabelRemover } from './LabelRemover';

async function run(): Promise<void> {
    const prPayload = github.context.payload.pull_request;
    if (!prPayload) {
        throw new Error('This action can only be run on pull request events.');
    }

    const requiredLabels = JSON.parse(core.getInput('required_labels')) as string[];
    const anyOfLabels = JSON.parse(core.getInput('any_of_labels')) as string[][];
    const skipLabelsCheck = JSON.parse(core.getInput('skip_labels_check')) as string[];
    const githubApi= github.getOctokit(core.getInput('token'));
    const context = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        prNumber: prPayload.number,
        actor: github.context.actor,
        prAuthor: prPayload.user.login,
        branchName: prPayload.head.ref,
        eventName: github.context.eventName,
        eventAction: github.context.payload.action || '',
    }
    const labelRemover: LabelRemover = new LabelRemover(githubApi, context);
    if (context.eventName === 'pull_request' && context.eventAction === 'synchronize') {
        await labelRemover.removeLabel(requiredLabels)
        core.info('Removing required labels because a new commit was pushed to the branch.')
    }
    const labelChecker: LabelChecker = new LabelChecker(githubApi, context, labelRemover);
    if(await labelChecker.hasBypassSkipLabel(skipLabelsCheck)) {
        core.info('The PR has a label that allows skipping other checks.');
        return;
    }
    await labelChecker.checkAndRemoveApprovalIfCRPresent();
    await labelChecker.checkSelfLabelAssignment(requiredLabels);
    await labelChecker.verifyRequiredLabels(requiredLabels);
    await labelChecker.verifyAnyOfLabels(anyOfLabels);
}

run();