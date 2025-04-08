import * as core from '@actions/core';
import {JiraCreateRelease} from "./JiraCreateRelease";
import {OperationTypeEnum} from "./OperationTypeEnum";
import {JiraMarkRelease} from "./JiraMarkRelease";

async function run(): Promise<void> {
    const email:string = core.getInput('jira_email');
    const token:string = core.getInput('jira_token');
    const url:string = core.getInput('jira_url');
    const projectId:string = core.getInput('jira_project_id');
    const environment:string = core.getInput('environment');
    const idAwaitingToTesting:string = core.getInput('jira_id_awaiting_to_testing');
    const githubRef:string = core.getInput('github_ref');
    const version:string = core.getInput('version');
    const commitMessage:string = core.getInput('commit_message');
    const type:string = core.getInput('type') as OperationTypeEnum;


    const jira:JiraCreateRelease = new JiraCreateRelease(email, token, url, projectId, environment, idAwaitingToTesting, githubRef);

    switch (type) {
        case (OperationTypeEnum.CreateRelease):
            await jira.fetchTask();
            await jira.updateTaskStatus();
            await jira.createRelease();
            await jira.assignIssuesToRelease();
            break;
        case (OperationTypeEnum.MarkRelease):
            const jiraMark:JiraMarkRelease = new JiraMarkRelease(email, token, url, projectId, environment, commitMessage);
            await jiraMark.releaseVersion();
            break;
        default:
            core.setFailed('Unknown operation type');
    }


}

run();