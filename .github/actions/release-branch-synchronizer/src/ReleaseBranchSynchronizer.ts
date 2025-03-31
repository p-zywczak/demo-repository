import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';
export class ReleaseBranchSynchronizer {
    constructor(
        private readonly githubApi: InstanceType<typeof GitHub>,
        private readonly ver: string,
        private readonly  repoOwner: string,
        private readonly repoName: string,
    ) {
    }
    async fetchBranches() {

    }
    async checkReleaseBranchExists():Promise<boolean> {
        const branchNameToCheck:string = `release/${this.ver}`
        const { data: branches } = await this.githubApi.request('GET /repos/{owner}/{repo}/branches', {
            owner: this.repoOwner,
            repo: this.repoName,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        const exists = branches.some(branch => branch.name === branchNameToCheck)
        if(exists) {
            core.info(`Release branch '${branchNameToCheck}' already exists in the repository`);
        } else {
            core.info(`Release branch '${branchNameToCheck}' does not exist in the repository.`);
        }
        return exists;
    }
    async fetchLatestSha():Promise<void> {
        const { data: branches } = await this.githubApi.request('GET /repos/{owner}/{repo}/branches', {
            owner: this.repoOwner,
            repo: this.repoName,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        const releaseBranches = branches
            .map((branch: any) => branch.name)
            .filter((name: string) => /^release\/[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(name));
        core.info(`${releaseBranches}`);
    }
}