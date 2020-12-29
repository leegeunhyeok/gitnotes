import axios, { AxiosInstance, AxiosResponse } from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import {
  FirebaseConfig,
  GitHubAPIResponse,
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubContent,
  GitHubRef,
  GitHubTree,
  RepositoryContent,
  Commit,
  HashRequiredCommit,
  Ref,
} from '@/core/github/types';
export * as Types from '@/core/github/types';

class GitHubCore {
  static BASE_URL = 'https://api.github.com';
  private _api: AxiosInstance;
  private _provider: firebase.auth.GithubAuthProvider;

  constructor(firebaseConfig: FirebaseConfig) {
    this._api = axios.create({ baseURL: GitHubCore.BASE_URL });
    firebase.initializeApp(firebaseConfig);
    this._provider = new firebase.auth.GithubAuthProvider();
    this._provider.addScope('repo');
  }

  private toGitHubResponse<T>(res: AxiosResponse): GitHubAPIResponse<T> {
    return {
      data: res.data || null,
      status: res.status,
    };
  }

  login() {
    return firebase
      .auth()
      .signInWithPopup(this._provider)
      .then(({ credential }) => (credential as firebase.auth.OAuthCredential)?.accessToken);
  }

  setToken(token?: string) {
    if (token) {
      this._api.defaults.headers.common['Authorization'] = `token ${token}`;
    } else {
      delete this._api.defaults.headers.common['Authorization'];
    }
  }

  hasToken() {
    return !!this._api.defaults.headers.common['Authorization'];
  }

  /**
   * Get target user information
   * - API Reference: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
   */
  async getUser() {
    return this.toGitHubResponse<GitHubUser>(await this._api.get('/user'));
  }

  /**
   * Get target repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#get-a-repository
   * @param repositoryName Repository name
   * @param description Repository description
   */
  async getRepository(username: string, repository: string) {
    return this.toGitHubResponse<GitHubRepository>(
      await this._api.get(`/repos/${username}/${repository}`),
    );
  }

  /**
   * Create new repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#create-a-repository-for-the-authenticated-user
   * @param repository Repository name
   * @param description Repository description
   */
  async createRepository(repository: string, description: string) {
    return this.toGitHubResponse<GitHubRepository>(
      await this._api.post(`/user/repos`, { name: repository, description }),
    );
  }

  /**
   * Get single git reference
   * - API Reference: https://docs.github.com/en/rest/reference/git#get-a-reference
   * @param username GitHub username
   * @param repository GitHub repository
   * @param branch Target branch
   */
  async getRef(username: string, repository: string, branch: string) {
    return this.toGitHubResponse<GitHubRef>(
      await this._api.get(`/repos/${username}/${repository}/git/refs/heads/${branch}`),
    ).data.object.sha;
  }

  /**
   * Get a git single tree
   * - API Reference: https://docs.github.com/en/rest/reference/git#get-a-tree
   * @param username
   * @param repository
   * @param branch
   */
  async getTree(username: string, repository: string, branch: string) {
    return this.toGitHubResponse<GitHubTree>(
      await this._api.get(
        `/repos/${username}/${repository}/git/trees/heads/${branch}?recursive=true`,
      ),
    );
  }

  /**
   * Post git tree
   * - API Reference: https://docs.github.com/en/rest/reference/git#get-a-tree
   * @param username Username
   * @param repository Repository name
   * @param tree Git reference tree
   */
  async postTree(username: string, repository: string, tree: Ref[]) {
    return this.toGitHubResponse<GitHubTree>(
      await this._api.post(`/repos/${username}/${repository}/git/trees`, { tree }),
    );
  }

  /**
   * API Reference: https://docs.github.com/en/rest/reference/git#create-a-commit
   * @param username Username
   * @param repository Repository name
   * @param parent Parent commit hash
   * @param treeHash Target tree hash
   * @param message Commit message
   */
  async commit(username: string, repository: string, parent: string, treeHash: string, message: string) {
    return this.toGitHubResponse<GitHubCommit>(
      await this._api.post(`/repos/${username}/${repository}/git/commits`, {
        message,
        parents: [parent],
        tree: treeHash
      }),
    );
  }

  /**
   * Get repository file content
   * - API Reference: https://docs.github.com/en/rest/reference/repos#get-repository-content
   * @param username Username
   * @param repository Repository name
   * @param path File path
   */
  async getRepositoryContent(username: string, repository: string, path: string) {
    return this.toGitHubResponse<RepositoryContent>(
      await this._api.get(`/repos/${username}/${repository}/contents/${path}`),
    );
  }

  /**
   * Creates a new file or replaces an existing file in a repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
   * @param username Username
   * @param repository Repository name
   * @param path File path
   * @param commit Commit configuration
   *  - `sha` required if you are updating a file
   */
  async putRepositoryContent(
    username: string,
    repository: string,
    path: string,
    content: string,
    commit: Commit,
  ) {
    return this.toGitHubResponse<GitHubContent>(
      await this._api.put(`/repos/${username}/${repository}/contents/${path}`, {
        ...commit,
        content,
      }),
    );
  }

  /**
   * Delete file from repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#delete-a-file
   * @param username Username
   * @param repository Repository name
   * @param path File path
   * @param commit Commit configuration
   */
  async deleteRepositoryContent(
    username: string,
    repository: string,
    path: string,
    commit: HashRequiredCommit,
  ) {
    return (
      this.toGitHubResponse(
        await this._api.delete(`/repos/${username}/${repository}/contents/${path}`, {
          data: commit,
        }),
      ).status === 200
    );
  }
}

import config from '@/firebase-config.json';
export default new GitHubCore(config);
