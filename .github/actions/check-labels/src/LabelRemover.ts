import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
import { GithubContext } from './types';
import { LabeledEvent } from './types';
import {LabelChecker} from "./LabelChecker";
export class LabelRemover extends LabelChecker
{
    async removeLabel(label: string): Promise<void>
    {
        const { owner, repo, prNumber } = this.context;
        await this.githubApi.rest.issues.removeLabel({
            owner,
            repo,
            issue_number: prNumber,
            name: label,
        });
    }
}