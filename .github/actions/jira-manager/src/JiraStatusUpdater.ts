import * as core from '@actions/core';
import * as github from '@actions/github';
import { Version3Client } from 'jira.js'
import {JiraStatusUpdaterInterface} from "./JiraStatusUpdaterInterface";

export class JiraStatusUpdater {
    protected client: Version3Client;
    protected githubApi;
    protected context = github.context;
    protected issueKey!:string;

    constructor(private readonly options: JiraStatusUpdaterInterface) {
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
    async init(): Promise<void> {
        this.issueKey = await this.extractIssueKey();
    }
    private async extractIssueKey():Promise<string> {
        let branchName: string;

        if( this.context.payload.pull_request?.head?.ref ) {
            branchName = this.context.payload.pull_request.head.ref;
        } else if (this.context.payload.ref) {
            branchName = this.context.payload.ref.replace('refs/heads/', '');
        } else if (this.context.payload.issue?.number) {
            const prNumber = this.context.payload.issue.number;
            try {
                const prData = await this.githubApi.rest.pulls.get({
                    owner: this.context.repo.owner,
                    repo: this.context.repo.repo,
                    pull_number: prNumber,
                });
                branchName = prData.data.head.ref;
            } catch (error) {
                core.error(`Błąd pobierania danych PR: ${error}`);
            }
        }
        core.debug(`Branch z issue_comment: ${branchName!}`);
        const match = branchName!.match(/([A-Za-z]+-\d+)/);

        return match![1];
    }
    public async processCodeReviewDoneStatus(){
        const labels = await this.fetchLabelsOnPR();
        const missingLabels:string[] = this.options.requiredLabels!.filter(label => !labels.includes(label));
        if ( missingLabels.length > 0 ) {
            core.setFailed(`Missing required label(s): ${missingLabels.join(', ')}.`);
            await this.updateTaskStatus(this.options.idCodeReview!);
        } else {
            await this.updateTaskStatus(this.options.idCodeReviewDone!);
        }
    }
    public async processAwaitingToReleaseStatus(){
        await this.updateTaskStatus(this.options.idAwaitingToRelease!);
    }
    public async processCodeReviewStatus(){
        await this.updateTaskStatus(this.options.idCodeReview!);
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
        core.info(`KEY: ${this.issueKey} ID: ${id}`);
        core.info(`BRANCH_NAMEREF: ${JSON.stringify(github.context.payload, null, 2)}`);
        await this.client.issues.doTransition({
            issueIdOrKey: this.issueKey,
            transition: { id: id}
        });
        core.info('Successful - updated transaction');
    }
}