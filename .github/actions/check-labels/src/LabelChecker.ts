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
        return data.map(label => ({ name: label.name }));
    }
}