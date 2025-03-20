import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { GithubContext } from './types';
import { LabeledEvent } from './types';

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
                core.setFailed(`PR does not have the required label: ${label}.`);
            }
        });
    }
    async verifyAnyOfLabels(anyOfLabelsGroups: string[][]):Promise<void>
    {
        const labelsNames = await this.fetchLabelsOnPR();
        anyOfLabelsGroups.forEach((group: string[]) => {
            const hasLabel = labelsNames.some(label => group.includes(label))
            if(!hasLabel) {
                core.setFailed((`Missing labels from the group: ${group.join(' OR ')}.`))
            }
        });
    }
    async checkSelfLabelAssignment(labels: string[])
    {
        const {owner, repo, prNumber, prAuthor} = this.context
        const eventsResponse = await this.githubApi.rest.issues.listEventsForTimeline({
            owner,
            repo,
            issue_number: prNumber,
        });
        const events = eventsResponse.data as LabeledEvent[];
        labels.forEach((label: string) => {
            const addedByAuthor = events.find((event: LabeledEvent) =>
                event.event === 'labeled' &&
                event.label?.name === label &&
                event.actor?.login === prAuthor
            );
            if (addedByAuthor) {
                core.setFailed(`PR author cannot assign the label ${label} to themselves.`);
            }
        });
    }
}