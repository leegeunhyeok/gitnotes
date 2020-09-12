/**
 * Github API response data
 */

export type StringOrEmpty = string | null;
export type NumberOrEmpty = number | null;
export type BooleanOrEmpty = boolean | null;

export interface User {
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

export interface Repository {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  default_branch: string;
}

export interface RepositoryFileContent {
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
}

export interface RepositoryUpdate {
  content: RepositoryFileContent;
}
