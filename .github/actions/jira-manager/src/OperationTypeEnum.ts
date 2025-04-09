import {JiraStatusUpdater} from "./JiraStatusUpdater";

export enum OperationTypeEnum {
    CreateRelease = 'createRelease',
    MarkRelease = 'markRelease',
    CodeReviewDoneStatusUpdater = 'codeReviewDoneStatusUpdater',
    AwaitingToReleaseStatusUpdater = 'awaitingToReleaseStatusUpdater',
    CodeReviewStatusUpdater = 'codeReviewStatusUpdater',
}