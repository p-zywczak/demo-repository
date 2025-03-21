import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { GithubContext } from './types';
import { LabeledEvent } from './types';
import {LabelRemover} from "./LabelRemover";

export class LabelChecker
{
    protected githubApi: InstanceType<typeof GitHub>;
    protected context: GithubContext;
    private labelRemover: LabelRemover;
    private cachedLabels: string[] | null = null;
    public constructor(
        githubApi: InstanceType<typeof GitHub>,
        context: GithubContext,
        labelRemover: LabelRemover
    ) {
        this.githubApi = githubApi;
        this.context = context;
        this.labelRemover = labelRemover;
    }
    async fetchLabelsOnPR(): Promise<any>
    {
        if(this.cachedLabels) {
            return this.cachedLabels;
        }
        const {owner, repo, prNumber} = this.context
        const { data } = await this.githubApi.rest.issues.listLabelsOnIssue({
            owner,
            repo,
            issue_number: prNumber,
        });
        this.cachedLabels = data.map(label => label.name);
        return this.cachedLabels;
    }
    async verifyRequiredLabels(required: string[]): Promise<void>
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
        const isHotfixBranch = this.context.branchName.startsWith('hotfix');
        if (isHotfixBranch) {
            core.info('Hotfix branch detected – skipping label verification.');
            return;
        }
        const labelsNames = await this.fetchLabelsOnPR();
        anyOfLabelsGroups.forEach((group: string[]) => {
            const hasLabel = labelsNames.some((label: string) => group.includes(label))
            if(!hasLabel) {
                core.setFailed((`Missing labels from the group: ${group.join(' OR ')}.`))
            }
        });
    }
    async checkSelfLabelAssignment(labels: string[]): Promise<void>
    {
        const {owner, repo, prNumber, prAuthor} = this.context
        const eventsResponse = await this.githubApi.rest.issues.listEventsForTimeline({
            owner,
            repo,
            issue_number: prNumber,
        });
        const events = eventsResponse.data as LabeledEvent[];
        events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        labels.forEach((label: string) => {
            const labelAddEvent = events.find((event: LabeledEvent) =>
                event.event === 'labeled' &&
                event.label?.name === label &&
                event.actor?.login === prAuthor
            );
            const labelRemoveEvent = events.find((event: LabeledEvent) =>
                event.event === 'unlabeled' &&
                event.label?.name === label &&
                event.actor?.login === prAuthor
            );
            if (labelAddEvent) {
                if (!labelRemoveEvent || new Date(labelAddEvent.created_at) > new Date(labelRemoveEvent.created_at)) {
                    core.setFailed(`PR author cannot assign the label ${label} to themselves.`);
                }
            }
        });
    }
    async hasBypassSkipLabel(labels: string[]): Promise<any>
    {
        const labelsNames = await this.fetchLabelsOnPR();
        labels.forEach(label => {
            return labelsNames.includes(label);
        })
    }
    async checkAndRemoveApprovalIfCRPresent(): Promise<void>
    {
        const labelsNames = await this.fetchLabelsOnPR();
        const hasCRLabel = labelsNames.some((label: string) => /CR/.test(label));
        if(!hasCRLabel && labelsNames.includes('APPROVAL')) {
            await this.labelRemover.removeLabel(['APPROVAL']);
        }
    }
}