export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface GitHubAPIResponse<T> {
  data: T;
  status: number;
}

export type StringOrEmpty = string | null;
export type NumberOrEmpty = number | null;
export type BooleanOrEmpty = boolean | null;

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: StringOrEmpty;
  gravatar_id: StringOrEmpty;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: BooleanOrEmpty;
  name: StringOrEmpty;
  company: StringOrEmpty;
  blog: StringOrEmpty;
  location: StringOrEmpty;
  email: StringOrEmpty;
  hireable: BooleanOrEmpty;
  bio: StringOrEmpty;
  twitter_username: StringOrEmpty;
  public_repos: NumberOrEmpty;
  public_gists: NumberOrEmpty;
  followers: NumberOrEmpty;
  following: NumberOrEmpty;
  created_at: StringOrEmpty;
  updated_at: StringOrEmpty;
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  html_url: string;
  commit: {
    url: string;
    html_url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    tree: {
      sha: string;
      url: string;
    };
    message: string;
  };
}

export interface GitHubContent {
  content: {
    name: string;
    path: string;
    sha: string;
    url: string;
  };
  commit: GitHubCommit;
}

export interface GitHubRepository {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  default_branch: string;
}

export interface RepositoryContent {
  name: string;
  path: string;
  content: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  commit: GitHubCommit;
}

export interface GitHubRef {
  ref: string;
  node_id: string;
  url: string;
  object: {
    type: string;
    sha: string;
    url: string;
  };
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: Ref[];
  truncated: boolean;
}

export interface Ref {
  path: string;
  mode: string;
  type: string;
  size: number;
  sha?: string;
}

export interface Commit {
  message: string;
  branch?: string;
  sha?: string;
}

export interface HashRequiredCommit extends Commit {
  sha: string;
}
