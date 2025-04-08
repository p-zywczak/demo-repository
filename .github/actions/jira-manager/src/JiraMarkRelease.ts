import * as core from '@actions/core';
import { Version3Client } from 'jira.js'

export class JiraMarkRelease
{
    protected client:Version3Client;
    private version: string;
    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
        private readonly commitMessage:string
    ) {
        this.client = new Version3Client({
            host: url,
            authentication: {
                basic: {
                    email: email,
                    apiToken: token,
                }
            }
        });
        const versionRegex:RegExp = /(release|hotfix)\/(\d+\.\d+\.\d+(?:\.\d+)?)/i;
        const match:RegExpMatchArray | null = commitMessage.match(versionRegex);
        if (!match) {
            core.error('Not found version in commit message');
        }
        this.version = match![2];
    }
    public async releaseVersion():Promise<void> {
        const releases = await this.fetchAllReleases();
        const releaseName:string = `[${this.environment}] v${this.version}`;
        const targetRelease = releases.find((release: any) => release.name === releaseName);
        if(!targetRelease) {
            core.error(`Not found release: ${releaseName} in jira  `)
        } else {
            await this.markRelease(targetRelease.id);
        }
    }
    private async fetchAllReleases():Promise<any> {
        return this.client.projectVersions.getProjectVersions({
            projectIdOrKey: this.projectId
        });
    }
    private async markRelease(releaseId: string | undefined): Promise<void> {
        await this.client.projectVersions.updateVersion({
            id: releaseId!,
            released: true
        });
        core.info('Successful - released')
    }
}