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
    async createEmptyRelease():Promise<void>{
        const latestReleaseSHA:string = await this.fetchLatestSha();
        const branchRef = `refs/heads/release/${this.ver}`;
        await this.githubApi.request('POST /repos/{owner}/{repo}/git/refs', {
            owner: this.repoOwner,
            repo: this.repoName,
            ref: branchRef,
            sha: latestReleaseSHA,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        core.info(`Created empty release branch`);
    }
    private async fetchLatestSha():Promise<string> {
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

        const versions = releaseBranches.map(name => name.replace(/^release\//, ''));
        const sortedVersions = versions.sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
        const latestVersion = sortedVersions[sortedVersions.length - 1];
        const latestReleaseBranch:string = `release/${latestVersion}`;
        const { data: refData } = await this.githubApi.request(
            'GET /repos/{owner}/{repo}/git/ref/{ref}',
            {
                owner: this.repoOwner,
                repo: this.repoName,
                ref: `heads/${latestReleaseBranch}`
            }
        );
        core.info(`Newest branch release: ${latestReleaseBranch}`);
        return refData.object.sha;
    }
}