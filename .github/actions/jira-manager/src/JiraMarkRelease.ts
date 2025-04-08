import * as core from '@actions/core';
import { Version3Client } from 'jira.js'

export class JiraMarkRelease
{
    protected client:Version3Client;
    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
        private readonly version:string
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
    }
    public async releaseVersion():Promise<void> {
        const releases = await this.fetchAllReleases();
        const releaseName:string = `[${this.environment}] v${this.version}`;
        const targetRelease = releases.find((release: any) => release.name === releaseName);
        if(!targetRelease) {
            core.info(`Not found release: ${releaseName} in jira  `)
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