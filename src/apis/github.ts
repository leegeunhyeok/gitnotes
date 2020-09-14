import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  User,
  Repository,
  RepositoryFileContent,
  RepositoryUpdate,
  GitRef,
  GitTree,
  Ref,
} from '@/interfaces/github';

const BASE_URL = 'https://api.github.com';

interface RepositoryPath {
  user: string;
  repository: string;
  path: string;
}

interface RepositoryPathWithFile extends RepositoryPath {
  content: string;
  sha?: string;
}

interface Commit {
  message: string;
  branch?: string;
}

type PutType = 'added' | 'updated' | 'unknown';

// Issue in axios (config in data)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AxiosRequestConfigWithAny = AxiosRequestConfig & any;

interface GithubAPIResponse<T> {
  data: T;
  status: number;
}

class AxiosController {
  private _axios: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this._axios = instance;
    // Github API v3 recommended.
    this._axios.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';
  }

  /**
   * Extract only data and status code
   * @param response API Response
   */
  private responseHandler<T>(response: AxiosResponse): GithubAPIResponse<T> {
    return {
      data: response.data || null,
      status: response.status,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfigWithAny) {
    return this.responseHandler<T>(await this._axios.get(url, config));
  }

  async post<T>(url: string, config?: AxiosRequestConfigWithAny) {
    return this.responseHandler<T>(await this._axios.post(url, config));
  }

  async put<T>(url: string, config?: AxiosRequestConfigWithAny) {
    return this.responseHandler<T>(await this._axios.put(url, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfigWithAny) {
    return this.responseHandler<T>(await this._axios.delete(url, config));
  }

  setAuthorizationToken(token: string) {
    this._axios.defaults.headers.common['Authorization'] = `token ${token}`;
  }

  resetAuthorizationToken() {
    delete this._axios.defaults.headers.common['Authorization'];
  }
}

class GithubError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class GithubAPI {
  private static instance: GithubAPI | null = null;
  private _api: AxiosController;
  private _token?: string;

  private constructor() {
    GithubAPI.instance = this;
    const instance = axios.create({ baseURL: BASE_URL });
    this._api = new AxiosController(instance);
  }

  // Singleton
  public static getInstance() {
    if (!GithubAPI.instance) {
      GithubAPI.instance = new GithubAPI();
    }
    return GithubAPI.instance;
  }

  /**
   * Use token for authorization
   * @param token Githun Personal Access Token
   */
  setPersonalAccessToken(token: string) {
    this._token = token;
    this._api.setAuthorizationToken(this._token);
  }

  /**
   * Remove token
   */
  resetPersonalAccessToken() {
    this._token = undefined;
    this._api.resetAuthorizationToken();
  }

  /**
   * Get target user information
   * - API Docs: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
   */
  async me(token: string): Promise<User> {
    return (
      await this._api.get<User>(`/users`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
    ).data;
  }

  /**
   * Get target repository
   * - API Docs: https://docs.github.com/en/rest/reference/repos#get-a-repository
   */
  async getRepository(username: string, repository: string): Promise<Repository> {
    return (await this._api.get<Repository>(`/repos/${username}/${repository}`)).data;
  }

  /**
   * Get target user information
   * - API Docs: https://docs.github.com/en/rest/reference/users#get-a-user
   *
   * @param username Target username
   */
  async getUser(username: string): Promise<User> {
    return (await this._api.get<User>(`/users/${username}`)).data;
  }

  /**
   * Create new repository
   * - API Docs: https://docs.github.com/en/rest/reference/repos#create-a-repository-for-the-authenticated-user
   * @param name
   * @param description
   */
  async createRepository(name: string, description: string): Promise<Repository> {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }

    return (
      await this._api.post<Repository>(`/user/repos`, {
        name,
        description,
      })
    ).data;
  }

  /**
   * - API Docs: https://docs.github.com/en/rest/reference/git#get-a-reference
   * @param username
   * @param repository
   * @param lastCommit
   */
  async getRef(username: string, repository: string, branch: string) {
    const { data } = await this._api.get<GitRef>(
      `/repos/${username}/${repository}/git/refs/heads/${branch}`,
    );
    return data.object.sha;
  }

  /**
   * - API Docs: https://docs.github.com/en/rest/reference/git#get-a-tree
   * @param username Username
   * @param repository Repository name
   * @param lastCommit Latest commit sha hash
   */
  async getTree(username: string, repository: string, lastCommit: string) {
    const { data } = await this._api.get<GitTree>(
      `/repos/${username}/${repository}/git/trees/heads/${lastCommit}?recursive=true`,
    );
    return { sha: data.sha, tree: data.tree };
  }

  /**
   * - API Docs: https://docs.github.com/en/rest/reference/git#get-a-tree
   * @param username Username
   * @param repository Repository name
   * @param tree Git reference tree
   */
  postTree(username: string, repository: string, tree: Ref[]) {
    return this._api.get<null>(`/repos/${username}/${repository}/git/trees`, { tree });
  }

  /**
   * API Docs: https://docs.github.com/en/rest/reference/git#create-a-commit
   * @param username Username
   * @param repository Repository name
   * @param parent Parent commit sha hash
   * @param tree Git reference tree
   * @param message Commit message
   */
  async commit(username: string, repository: string, parent: string, tree: Ref[], message: string) {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }

    return (
      await this._api.post<{ sha: string }>(`/repos/${username}/${repository}/git/commits`, {
        message,
        parents: [parent],
        tree,
      })
    ).data.sha;
  }

  /**
   * Get repository file content
   * - API Docs: https://docs.github.com/en/rest/reference/repos#get-repository-content
   *
   * @param config Repository path config
   */
  async getRepositoryContent(config: RepositoryPath) {
    return await this._api.get<RepositoryFileContent>(
      `/repos/${config.user}/${config.repository}/contents/${config.path}`,
    );
  }

  /**
   * Creates a new file or replaces an existing file in a repository
   * - API Docs: https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
   *
   * @param config Repository path config with file
   *  - `sha` required if you are updating a file
   */
  async putRepositoryContent(config: RepositoryPathWithFile & Commit) {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }

    const { user, repository, path } = config;
    const res = await this._api.put<RepositoryUpdate>(
      `/repos/${user}/${repository}/contents/${path}`,
      {
        message: config.message,
        content: config.content,
        ...(config.branch ? { branch: config.branch } : null),
        ...(config.sha ? { sha: config.sha } : null),
      },
    );

    let type = '';
    switch (res.status) {
      case 200:
        type = 'added';
        break;

      case 201:
        type = 'updated';
        break;

      default:
        type = 'unknown';
    }

    return {
      data: res.data.content,
      type: type as PutType,
    };
  }

  /**
   * Delete file from repository
   * - API Docs: https://docs.github.com/en/rest/reference/repos#delete-a-file
   *
   * @param config Repository path config
   */
  async deleteRepositoryContent(config: RepositoryPath & Commit & { sha: string }) {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }

    const { user, repository, path } = config;
    const res = await this._api.delete<null>(`/repos/${user}/${repository}/contents/${path}`, {
      message: config.message,
      sha: config.sha,
      ...(config.branch ? { branch: config.branch } : null),
    });

    return {
      deleted: res.status === 200,
    };
  }
}

export default GithubAPI.getInstance();
