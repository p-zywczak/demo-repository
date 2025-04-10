import * as core from '@actions/core';
import { Version3Client } from 'jira.js'

export class JiraCreateRelease
{
    protected client:Version3Client;
    private issueKeys:string[];
    private versionName:string;
    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
        private readonly idAwaitingToTesting:string,
        private readonly githubRef:string,
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
        this.versionName = `[${this.environment}] v${githubRef.split('/').pop()}`;
        this.issueKeys = [];
    }
    public async fetchTask():Promise<void> {
        const jql = `status="AWAITING TO RELEASE" AND labels="${this.environment}" AND project="${this.projectId}" AND labels NOT IN ("SkipTesting")`;
        const searchResponse = await this.client.issueSearch.searchForIssuesUsingJql({ jql });
        const issues: any[] = searchResponse.issues ?? [];
        this.issueKeys = issues.map((issue: any) => issue.key);
        core.info(`Found tasks: ${this.issueKeys.join(', ')}`);
    }
    public async updateTaskStatus():Promise<void> {
        for (const key of this.issueKeys) {
            await this.client.issues.doTransition({
                issueIdOrKey: key,
                transition: { id: this.idAwaitingToTesting}
            });
        }
        core.info('Successful - updated transaction');
    }
    public async createRelease():Promise<void> {
        await this.client.projectVersions.createVersion({
            name: this.versionName,
            projectId: this.projectId,
            released: false
        })
        core.info(`Successful - release created in jira: ${this.versionName}`);
    }
    public async assignIssuesToRelease():Promise<void> {
        for (const key of this.issueKeys) {
            core.info(`Assign issues ${key} to version ${this.versionName}`);
            await this.client.issues.editIssue({
                issueIdOrKey: key,
                update: {
                    fixVersions: [
                        { add: { name: this.versionName } }
                    ]
                }
            });
        }
    }
    public async fetchAllReleases():Promise<void> {

    }
}