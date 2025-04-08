import * as core from '@actions/core';
import {Jira} from "./Jira";
import {OperationTypeEnum} from "./OperationTypeEnum";

async function run(): Promise<void> {
    const email:string = core.getInput('jira_email');
    const token:string = core.getInput('jira_token');
    const url:string = core.getInput('jira_url');
    const projectId:string = core.getInput('jira_project_id');
    const environment:string = core.getInput('environment');
    const idAwaitingToTesting = core.getInput('jira_id_awaiting_to_testing');
    const githubRef:string = core.getInput('github_ref');
    const type:string = core.getInput('type') as OperationTypeEnum;


    const jira:Jira = new Jira(email, token, url, projectId, environment, idAwaitingToTesting, githubRef);

    switch (type) {
        case (OperationTypeEnum.CreateRelease):
            await jira.fetchTask();
            await jira.updateTaskStatus();
            await jira.createRelease();
            await jira.assignIssuesToRelease();
            break;
        default:
            core.setFailed('Unknown operation type');
    }


}

run();