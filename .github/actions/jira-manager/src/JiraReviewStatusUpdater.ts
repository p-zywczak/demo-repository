import * as core from '@actions/core';
import * as github from '@actions/github';
import { Version3Client } from 'jira.js'

export class JiraReviewStatusUpdater {
    protected client: Version3Client;
    protected githubApi;
    protected context = github.context;
    protected issueNumber:string;

    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly githubToken:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
        private readonly requiredLabels:string[],
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
        this.githubApi = github.getOctokit(githubToken);
        this.issueNumber = githubRef.split('/').pop()!;
    }
    public async handle(){
        const labels = await this.fetchLabelsOnPR();
        this.requiredLabels.forEach( label => {
            if (!labels.includes(label)) {
                core.setFailed(`Missing required label '${label}' to perform the status change.`);
                //process.exit(1);
            }
        });

        core.info(`Labels : ${this.issueNumber}`);
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