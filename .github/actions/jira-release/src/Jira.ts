import * as core from '@actions/core';
import { Version3Client } from 'jira.js'

export class Jira
{
    protected client:Version3Client;
    private issueKeys:string[];
    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly url:string,
    ) {
        this.client = new Version3Client({
            host: url,
            authentication: {
                basic: {
                    email: email,
                    apiToken: token,
                }
            }
        });
        this.issueKeys = [];
    }
    public async fetchTask():Promise<void> {
        const projectId = process.env.JIRA_PROJECT_ID;
        const jql = `status="AWAITING TO RELEASE" AND labels="${process.env.ENVIRONMENT}" AND project="${projectId}" AND labels NOT IN ("SkipTesting")`;
        core.info(`JQL: ${jql}`);
        const searchResponse = await this.client.issueSearch.searchForIssuesUsingJql({ jql });
        const issues: any[] = searchResponse.issues ?? [];
        this.issueKeys = issues.map((issue: any) => issue.key);
        core.info(`Znalezione zadania: ${this.issueKeys.join(', ')}`);
    }
}