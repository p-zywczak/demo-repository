import * as core from '@actions/core';
import {JiraCreateRelease} from "./JiraCreateRelease";
import {OperationTypeEnum} from "./OperationTypeEnum";
import {JiraMarkRelease} from "./JiraMarkRelease";
import {JiraReviewStatusUpdater} from "./JiraReviewStatusUpdater";

async function run(): Promise<void> {
    const email:string = core.getInput('jira_email');
    const token:string = core.getInput('jira_token');
    const github_token:string = core.getInput('github_token');
    const url:string = core.getInput('jira_url');
    const projectId:string = core.getInput('jira_project_id');
    const environment:string = core.getInput('environment');
    const idAwaitingToTesting:string = core.getInput('jira_id_awaiting_to_testing');
    const idCodeReviewDone:string = core.getInput('jira_id_code_review_done');
    const githubRef:string = core.getInput('github_ref');
    const commitMessage:string = core.getInput('commit_message');
    const requiredLabels = JSON.parse(core.getInput('required_labels')) as string[];
    const type:string = core.getInput('type') as OperationTypeEnum;

    core.info(`GithubREF: ${githubRef}`);

    switch (type) {
        case (OperationTypeEnum.CreateRelease):
            const jira:JiraCreateRelease = new JiraCreateRelease(email, token, url, projectId, environment, idAwaitingToTesting, githubRef);
            await jira.fetchTask();
            await jira.updateTaskStatus();
            await jira.createRelease();
            await jira.assignIssuesToRelease();
            break;
        case (OperationTypeEnum.MarkRelease):
            const jiraMark:JiraMarkRelease = new JiraMarkRelease(email, token, url, projectId, environment, commitMessage);
            await jiraMark.releaseVersion();
            break;
        case (OperationTypeEnum.ReviewStatusUpdater):
            const jiraReview:JiraReviewStatusUpdater = new JiraReviewStatusUpdater(email, token, github_token, url, projectId, environment, requiredLabels);
            await jiraReview.handle();
            break;
        default:
            core.setFailed('Unknown operation type');
    }


}

run();