import * as core from '@actions/core';
import {JiraCreateRelease} from "./JiraCreateRelease";
import {OperationTypeEnum} from "./OperationTypeEnum";
import {JiraMarkRelease} from "./JiraMarkRelease";
import {JiraStatusUpdater} from "./JiraStatusUpdater";
import {JiraStatusUpdaterInterface} from "./JiraStatusUpdaterInterface";

async function run(): Promise<void> {
    const email:string = core.getInput('jira_email');
    const token:string = core.getInput('jira_token');
    const githubToken:string = core.getInput('github_token');
    const url:string = core.getInput('jira_url');
    const projectId:string = core.getInput('jira_project_id');
    const environment:string = core.getInput('environment');
    const idAwaitingToTesting:string = core.getInput('jira_id_awaiting_to_testing');
    const idCodeReviewDone:string = core.getInput('jira_id_code_review_done');
    const idAwaitingToRelease:string = core.getInput('jira_id_awaiting_to_release');
    const idCodeReview:string = core.getInput('jira_id_code_review');
    const githubRef:string = core.getInput('github_ref');
    const commitMessage:string = core.getInput('commit_message');
    const requiredLabels:string[] = JSON.parse(core.getInput('required_labels') || '[]') as string[];
    const type:string = core.getInput('type') as OperationTypeEnum;
    core.info(`MAIN GITHUB: ${ githubRef }`);
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
        case (OperationTypeEnum.CodeReviewDoneStatusUpdater):
            const optionsCodeReviewDone: JiraStatusUpdaterInterface = {
                email,
                token,
                githubToken,
                url,
                requiredLabels,
                idCodeReviewDone,
                idCodeReview
            };
            const jiraReview:JiraStatusUpdater = new JiraStatusUpdater(optionsCodeReviewDone);
            await jiraReview.init();
            await jiraReview.processCodeReviewDoneStatus();
            break;
        case (OperationTypeEnum.AwaitingToReleaseStatusUpdater):
            const optionsAwaiting: JiraStatusUpdaterInterface = {
                email,
                token,
                githubToken,
                url,
                idAwaitingToRelease
            };
            const jiraReviewRelease:JiraStatusUpdater = new JiraStatusUpdater(optionsAwaiting);
            await jiraReviewRelease.init();
            await jiraReviewRelease.processAwaitingToReleaseStatus();
            break;
        case (OperationTypeEnum.CodeReviewStatusUpdater):
            const optionsCodeReview: JiraStatusUpdaterInterface = {
                email,
                token,
                githubToken,
                url,
                idCodeReview,
                githubRef
            };
            const jiraCodeReview:JiraStatusUpdater = new JiraStatusUpdater(optionsCodeReview);
            await jiraCodeReview.init();
            await jiraCodeReview.processCodeReviewStatus();
            break;
        default:
            core.setFailed('Unknown operation type');
    }
}

run();