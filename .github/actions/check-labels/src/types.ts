export interface GithubContext {
    owner: string;
    repo: string;
    prNumber: number;
    actor: string;
    prAuthor: string;
    branchName: string;
}
export interface LabeledEvent {
    event: string;
    label?: { name: string };
    actor?: { login: string };
    created_at: string;
}