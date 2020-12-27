import axios, { AxiosInstance, AxiosResponse } from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import * as I from '@/core/github/interface';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

class GitHubCore {
  static BASE_URL = 'https://api.github.com';
  private api: AxiosInstance;
  private provider: firebase.auth.GithubAuthProvider;

  constructor(firebaseConfig: FirebaseConfig) {
    this.api = axios.create({ baseURL: GitHubCore.BASE_URL });
    firebase.initializeApp(firebaseConfig);
    this.provider = new firebase.auth.GithubAuthProvider();
    this.provider.addScope('repo');
  }

  private toGitHubResponse<T>(res: AxiosResponse): I.GitHubAPIResponse<T> {
    return {
      data: res.data || null,
      status: res.status,
    };
  }

  requestOAuth() {
    return firebase
      .auth()
      .signInWithPopup(this.provider)
      .then(({ credential }) => (credential as firebase.auth.OAuthCredential)?.accessToken);
  }

  setToken(token?: string) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `token ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  hasToken() {
    return !!this.api.defaults.headers.common['Authorization'];
  }

  /**
   * Get target user information
   * - API Reference: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
   */
  async getUser() {
    return this.toGitHubResponse<I.GitHubUser>(await this.api.get('/user'));
  }

  /**
   * Get target repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#get-a-repository
   * @param repositoryName Repository name
   * @param description Repository description
   */
  async getRepository(username: string, repository: string) {
    return this.toGitHubResponse<I.GitHubRepository>(
      await this.api.get(`/repos/${username}/${repository}`),
    );
  }

  /**
   * Create new repository
   * - API Reference: https://docs.github.com/en/rest/reference/repos#create-a-repository-for-the-authenticated-user
   * @param repository Repository name
   * @param description Repository description
   */
  async createRepository(repository: string, description: string) {
    return this.toGitHubResponse<I.GitHubRepository>(
      await this.api.post(`/user/repos`, { name: repository, description }),
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
    return this.toGitHubResponse<I.GitHubRef>(
      await this.api.get(`/repos/${username}/${repository}/git/refs/heads/${branch}`),
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
    return this.toGitHubResponse<I.GitHubTree>(
      await this.api.get(
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
  async postTree(username: string, repository: string, tree: I.Ref[]) {
    return this.toGitHubResponse(
      await this.api.post(`/repos/${username}/${repository}/git/trees`, { tree }),
    );
  }

  /**
   * API Reference: https://docs.github.com/en/rest/reference/git#create-a-commit
   * @param username Username
   * @param repository Repository name
   * @param parent Parent commit hash
   * @param tree Git reference tree
   * @param message Commit message
   */
  async commit(
    username: string,
    repository: string,
    parent: string,
    tree: I.Ref[],
    message: string,
  ) {
    return this.toGitHubResponse<I.GitHubCommit>(
      await this.api.post(`/repos/${username}/${repository}/git/commits`, {
        message,
        parents: [parent],
        tree,
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
    return this.toGitHubResponse<I.RepositoryContent>(
      await this.api.get(`/repos/${username}/${repository}/contents/${path}`),
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
    commit: {
      message: string;
      content: string;
      branch?: string;
      sha?: string;
    },
  ) {
    return (
      this.toGitHubResponse(
        await this.api.put(`/repos/${username}/${repository}/contents/${path}`, commit),
      ).status -
        200 <=
      1
    ); // 200 or 201
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
    commit: {
      message: string;
      branch?: string;
      sha: string;
    },
  ) {
    return (
      this.toGitHubResponse(
        await this.api.delete(`/repos/${username}/${repository}/contents/${path}`, {
          data: commit,
        }),
      ).status === 200
    );
  }
}

export default new GitHubCore();
