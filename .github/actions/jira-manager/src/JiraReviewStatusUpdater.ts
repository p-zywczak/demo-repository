import * as core from '@actions/core';
import { Version3Client } from 'jira.js'

export class JiraReviewStatusUpdater {
    protected client: Version3Client;

    constructor(
        private readonly email:string,
        private readonly token:string,
        private readonly url:string,
        private readonly projectId:string,
        private readonly environment:string,
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
}