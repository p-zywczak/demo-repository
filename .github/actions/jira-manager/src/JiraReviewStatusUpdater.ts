import * as core from '@actions/core';
import * as github from '@actions/github';
import { Version3Client } from 'jira.js'
import {JiraReviewStatusUpdaterInterface} from "./JiraReviewStatusUpdaterInterface";

export class JiraReviewStatusUpdater {
    protected client: Version3Client;
    protected githubApi;
    protected context = github.context;
    protected issueKey:string = (github.context.payload.pull_request?.head?.ref.match(/([A-Za-z]+-\d+)/) || [])[1];

    constructor(private readonly options: JiraReviewStatusUpdaterInterface) {
        this.client = new Version3Client({
            host: options.url,
            authentication: {
                basic: {
                    email: options.email,
                    apiToken: options.token,
                }
            }
        });
        this.githubApi = github.getOctokit(options.githubToken);
    }
    public async processCodeReviewStatus(){
        const labels = await this.fetchLabelsOnPR();
        const missingLabels:string[] = this.options.requiredLabels.filter(label => !labels.includes(label));
        if ( missingLabels.length > 0 ) {
            core.setFailed(`Missing required label(s): ${missingLabels.join(', ')}.`);
            await this.updateTaskStatus(this.options.idCodeReview!);
        } else {
            await this.updateTaskStatus(this.options.idCodeReviewDone!);
        }
    }
    public async processAwaitingToReleaseStatus(){

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