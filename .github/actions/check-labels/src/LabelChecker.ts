import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { GithubContext } from './types';

export class LabelChecker
{
    private githubApi: InstanceType<typeof GitHub>;
    private context: GithubContext;
    public constructor(githubApi: InstanceType<typeof GitHub>, context: GithubContext) {
        this.githubApi = githubApi;
        this.context = context;
    }
    async fetchLabelsOnPR()
    {
        const {owner, repo, prNumber} = this.context
        const { data } = await this.githubApi.rest.issues.listLabelsOnIssue({
            owner,
            repo,
            issue_number: prNumber,
        });
        return data.map(label => label.name);
    }
    async verifyRequiredLabels(required: string[]):Promise<void>
    {
        const labelsNames = await this.fetchLabelsOnPR();
        const errors: string[] = [];
        required.forEach(label => {
            if (!labelsNames.includes(label)) {
                errors.push(`PR nie ma wymaganej etykiety ${label}.`);
            }
        });
        if (errors.length > 0) {
            core.setFailed(errors.join('\n'));
            throw new Error(errors.join('\n'));
        }
    }
}