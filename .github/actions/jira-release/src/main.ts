import * as core from '@actions/core';
import {Jira} from "./Jira";

async function run(): Promise<void> {
    const email:string = core.getInput('jira_email');
    const token:string = core.getInput('jira_token');
    const url:string = core.getInput('jira_url');
    const projectId:string = core.getInput('jira_project_id');
    const environment:string = core.getInput('environment');

    const jira:Jira = new Jira(email, token, url, projectId, environment);
    await jira.fetchTask();
}

run();