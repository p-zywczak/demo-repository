export interface JiraStatusUpdaterInterface {
    email: string;
    token: string;
    githubToken: string;
    url: string;
    requiredLabels?: string[];
    idCodeReviewDone?: string;
    idCodeReview?: string;
    idAwaitingToRelease?: string;
    githubRef?: string;
}