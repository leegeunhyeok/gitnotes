/**
 * Github API response data
 */

type StringOrEmpty = string | null;
type NumberOrEmpty = number | null;
type BooleanOrEmpty = boolean | null;

export interface Users {
  login: StringOrEmpty;
  id: NumberOrEmpty;
  node_id: StringOrEmpty;
  avatar_url: StringOrEmpty;
  gravatar_id: StringOrEmpty;
  url: StringOrEmpty;
  html_url: StringOrEmpty;
  followers_url: StringOrEmpty;
  following_url: StringOrEmpty;
  gists_url: StringOrEmpty;
  starred_url: StringOrEmpty;
  subscriptions_url: StringOrEmpty;
  organizations_url: StringOrEmpty;
  repos_url: StringOrEmpty;
  events_url: StringOrEmpty;
  received_events_url: StringOrEmpty;
  type: StringOrEmpty;
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
