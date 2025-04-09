import {JiraReviewStatusUpdater} from "./JiraReviewStatusUpdater";

export enum OperationTypeEnum {
    CreateRelease = 'createRelease',
    MarkRelease = 'markRelease',
    CodeReviewStatusUpdater = 'codeReviewStatusUpdater',
    AwaitingToReleaseStatusUpdater = 'awaitingToReleaseStatusUpdater',
}