import { GitHub } from '@actions/github/lib/utils';
import { GithubContext } from './types';

export class LabelRemover
{
    protected githubApi: InstanceType<typeof GitHub>;
    protected context: GithubContext;
    public constructor(
        githubApi: InstanceType<typeof GitHub>,
        context: GithubContext,
    ) {
        this.githubApi = githubApi;
        this.context = context;
    }
    async removeLabel(labels: string[]): Promise<void>
    {
        const { owner, repo, prNumber } = this.context;
        for(const label of labels) {
            await this.githubApi.rest.issues.removeLabel({
                owner,
                repo,
                issue_number: prNumber,
                name: label,
            });
        }
    }
}