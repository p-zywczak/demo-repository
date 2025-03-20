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
        required.forEach(label => {
            if (!labelsNames.includes(label)) {
                core.setFailed(`PR nie ma wymaganej etykiety ${label}.`);
            }
        });
    }
    async verifyAnyOfLabels(anyOfLabelsGroups: string[][]):Promise<void>
    {
        const labelsNames = await this.fetchLabelsOnPR();
        anyOfLabelsGroups.forEach((group) => {
            const hasLabel = labelsNames.some(label => group.includes(label))
            if(!hasLabel) {
                const groupStr = `[${group.join(', ')}]`;
                core.setFailed((`Brakuje labelek z grupy: ${groupStr}.`))
            }
        });
    }
}