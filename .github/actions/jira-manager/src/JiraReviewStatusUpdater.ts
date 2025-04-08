import * as core from '@actions/core';
import * as github from '@actions/github';
import { Version3Client } from 'jira.js'

export class JiraReviewStatusUpdater {
    protected client: Version3Client;
    protected githubApi;
    protected context = github.context;
    protected issueKey:string = (github.context.payload.pull_request?.head?.ref.match(/([A-Za-z]+-\d+)/) || [])[1];

    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly githubToken:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
        private readonly requiredLabels:string[],
        private readonly idCodeReviewDone:string,
        private readonly idCodeReview:string,
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
    public async processReviewStatus(){
        const labels = await this.fetchLabelsOnPR();
        const missingLabels:string[] = this.requiredLabels.filter(label => !labels.includes(label));
        if ( missingLabels.length > 0 ) {
            core.setFailed(`Missing required label(s): ${missingLabels.join(', ')}.`);
            await this.updateTaskStatus(this.idCodeReview);
        } else {
            await this.updateTaskStatus(this.idCodeReviewDone);
        }

        /*
        this.requiredLabels.forEach( label => {
            if (!labels.includes(label)) {
                core.setFailed(`Missing required label '${label}' to perform the status change.`);
                process.exit(1);
            }
        });
         */

        core.info(`Labels : ${this.issueKey}`);
    }
    public async processReviewStatusRollback(){

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
    public async updateTaskStatus(id:string):Promise<void> {
        await this.client.issues.doTransition({
            issueIdOrKey: this.issueKey,
            transition: { id: id}
        });
        core.info('Successful - updated transaction');
    }
}