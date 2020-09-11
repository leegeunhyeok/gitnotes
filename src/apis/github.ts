import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Users, Repository, RepositoryFileContent, RepositoryUpdate } from '@/interfaces/github';

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

  setCommonHeader(key: string, value: string) {
    this._axios.defaults.headers.common[key] = value;
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
    this._api.setCommonHeader('Authorization', `token ${this._token}`);
  }

  /**
   * Get target user information
   * - API Docs: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
   */
  async me(): Promise<Users> {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }
    return (await this._api.get<Users>(`/users`)).data;
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
  async getUser(username: string): Promise<Users> {
    return (await this._api.get<Users>(`/users/${username}`)).data;
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
   * Get repository file content
   * - API Docs: https://docs.github.com/en/rest/reference/repos#get-repository-content
   *
   * @param config Repository path config
   */
  async getRepositoryContent(config: RepositoryPath) {
    const res = await this._api.get<RepositoryFileContent | RepositoryFileContent[]>(
      `/repos/${config.user}/${config.repository}/contents/${config.path}`,
    );

    return {
      data: res.data,
      isDirectory: Array.isArray(res.data),
    };
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
  async deleteRepositoryContent(config: RepositoryPathWithFile & Commit & { sha: string }) {
    if (!this._token) {
      throw new GithubError('Github Personal Access Token not provided');
    }

    const { user, repository, path } = config;
    const res = await this._api.delete<null>(`/repos/${user}/${repository}/contents/${path}`, {
      message: config.message,
      content: config.content,
      sha: config.sha,
      ...(config.branch ? { branch: config.branch } : null),
    });

    return {
      deleted: res.status === 200,
    };
  }
}

export default GithubAPI.getInstance();
