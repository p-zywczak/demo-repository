import * as core from '@actions/core';
import {Jira} from "./Jira";

async function run(): Promise<void> {
    const email = JSON.parse(core.getInput('jira_email'));
    const token = JSON.parse(core.getInput('jira_token'));
    const url = JSON.parse(core.getInput('jira_url'));

    const jira:Jira = new Jira(email, token, url);
    await jira.fetchTask();
}

run();