export interface GithubContext {
    owner: string;
    repo: string;
    prNumber: number;
    actor: string;
    prAuthor: string;
    branchName: string;
}