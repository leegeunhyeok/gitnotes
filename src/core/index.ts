import GithubAPI from '@/apis/github';
import GitNotesDB from '@/database';
import { encode, decode } from 'js-base64';
import pkg from '~/package.json';

export interface GitNotesMeta {
  version: string;
  tags: Tag[];
  notes: Note[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sha: string;
  path: string;
}

const initialMeta: GitNotesMeta = {
  version: pkg.version,
  tags: [],
  notes: [],
};

export class GitNotesCore {
  public static META_FILE = '.gitnotes';
  public static NOTES_FOLDER = 'notes';
  public static REPO_DESC = '🌈 GitNotes';
  private static instance: GitNotesCore | null = null;
  private _db = GitNotesDB.getInstance();
  private _metaHash?: string;

  private constructor() {}

  public static getInstance() {
    if (!GitNotesCore.instance) {
      GitNotesCore.instance = new GitNotesCore();
    }
    return GitNotesCore.instance;
  }

  private getTimestamp() {
    const currentDate = new Date();
    const padder = (num: number, length: number = 2) => {
      const currentLength = num.toString().length;
      return currentLength < length
        ? num + new Array(length - currentLength).fill(0).join('')
        : num.toString();
    };
    const year = currentDate.getFullYear();
    const month = padder(currentDate.getMonth() + 1);
    const date = padder(currentDate.getDate());
    const hour = padder(currentDate.getHours());
    const minute = padder(currentDate.getMinutes());
    const second = padder(currentDate.getSeconds());
    return `${year}.${month}.${date} ${hour}:${minute}:${second}`;
  }

  prepareDatabase() {
    this._db
      .store('user', {
        login: String,
        name: String,
        bio: String,
        photo: String,
        token: String,
      })
      .store('repository', {
        name: String,
        branch: String,
      })
      .store('tag', {
        id: String,
        name: String,
        color: String,
        createdAt: Date,
      })
      .store('note', {
        id: String,
        title: String,
        content: String,
        createdAt: Date,
        updatedAt: Date,
      })
      .version(1);
  }

  getUserFromDB() {
    return this._db.select<UserObjectStore>('user');
  }

  getRepositoryFromDB() {
    return this._db.select<RepositoryObjectStore>('repository');
  }

  getGithubUser(username: string) {
    return GithubAPI.getUser(username);
  }

  validateToken(token: string) {
    return GithubAPI.me(token);
  }

  getRepository(username: string, repositoryName: string) {
    return GithubAPI.getRepository(username, repositoryName);
  }

  createRepository(repositoryName: string) {
    return GithubAPI.createRepository(repositoryName, GitNotesCore.REPO_DESC);
  }

  loadMeta(username: string, repositoryName: string) {
    return GithubAPI.getRepositoryContent({
      user: username,
      repository: repositoryName,
      path: GitNotesCore.META_FILE,
    })
      .then(({ data }) => {
        if (Array.isArray(data)) throw Error('Metadata must be file not directory');
        this._metaHash = data.sha;
        return JSON.parse(decode(data.content)) as GitNotesMeta;
      })
      .catch(err => {
        if (err?.response?.status === 404) {
          return this.saveMeta(username, repositoryName, initialMeta);
        } else {
          throw err;
        }
      });
  }

  saveMeta(username: string, repositoryName: string, metadata: GitNotesMeta) {
    return GithubAPI.putRepositoryContent({
      message: '',
      content: encode(JSON.stringify(metadata, null, 2)),
      ...(this._metaHash ? { sha: this._metaHash } : null),
      user: username,
      repository: repositoryName,
      path: GitNotesCore.META_FILE,
    }).then(({ data }) => {
      if (Array.isArray(data)) throw Error('Metadata must be file not directory');
      this._metaHash = data.sha;
      return JSON.parse(decode(data.content)) as GitNotesMeta;
    });
  }

  getContent(username: string, repositoryName: string, path: string) {
    return GithubAPI.getRepositoryContent({
      user: username,
      repository: repositoryName,
      path,
    });
  }

  putContent(username: string, repositoryName: string, path: string, content: any, sha?: string) {
    return GithubAPI.putRepositoryContent({
      content: encode(JSON.stringify(content, null, 2)),
      ...(sha ? { sha } : null),
      message: `GitNotes ${this.getTimestamp()}`,
      user: username,
      repository: repositoryName,
      path,
    });
  }

  deleteContent(username: string, repositoryName: string, path: string, sha: string) {
    return GithubAPI.deleteRepositoryContent({
      sha,
      message: `GitNotes ${this.getTimestamp()}`,
      user: username,
      repository: repositoryName,
      path,
    });
  }
}

const core = GitNotesCore.getInstance();
export default core;
