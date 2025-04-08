import * as core from '@actions/core';
import * as github from '@actions/github';
import { Version3Client } from 'jira.js'

export class JiraReviewStatusUpdater {
    protected client: Version3Client;
    protected githubApi;
    protected context = github.context;

    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly githubToken:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
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
        this.githubApi = github.getOctokit(githubToken);
    }
    public async handle(){
        const labels = this.fetchLabelsOnPR();
        core.info(`Labels : ${labels}`);
    }
    private async fetchLabelsOnPR(): Promise<any>
    {
        const {owner, repo} = this.context.repo
        const prNumber:number = this.context.payload.pull_request?.number!;
        const { data } = await this.githubApi.rest.issues.listLabelsOnIssue({
            owner,
            repo,
            issue_number: prNumber,
        });
        return data.map(label => label.name);
    }
}