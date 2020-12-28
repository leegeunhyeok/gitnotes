import { v4 as uuidv4 } from 'uuid';
import { encode, decode } from 'js-base64';
import { GitNotesMeta, User, Profile, Note, Tag, RaiseErrorConfig } from '@/core/types';
import GitHubCore, { GitHubCoreInterface } from '@/core/github';
import GitNotesDB from '@/database';
import pkg from '~/package.json';

export const initialMeta: GitNotesMeta = {
  version: pkg.version,
  tags: [],
  notes: [],
};

export const EmptyTag: Tag = {
  id: 'none',
  name: 'Empty',
  color: 'empty',
};

const EMPTY_USER: User = { login: '', branch: '', repository: '', token: '' };

class GitNotesError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class GitNotesCore {
  private static instance: GitNotesCore | null = null;
  public static COMMIT_PREFIX = 'GitNotes: ';
  public static META_FILE = '.gitnotes';
  public static NOTES_FOLDER = 'notes';
  public static REPO_DESC = '🌈 GitNotes';
  private _db = GitNotesDB.getInstance();
  private _refs: { sha: string; tree: GitHubCoreInterface.Ref[] } = { sha: '', tree: [] };
  private _metaHash?: string;
  private _user: User = EMPTY_USER;
  private _init = false;
  public github = GitHubCore;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!GitNotesCore.instance) {
      GitNotesCore.instance = new GitNotesCore();
    }
    return GitNotesCore.instance;
  }

  public static createId() {
    return uuidv4();
  }

  private toContent(data: string) {
    return encode(data);
  }

  private toData(content: string) {
    return decode(content);
  }

  private isReady(config?: RaiseErrorConfig) {
    const isReady = this._user.token && this._init && this._refs.tree.length > 0;
    if (!isReady && config?.raiseError) throw new GitNotesError('Core not ready');
    return isReady;
  }

  private getTimestamp(from?: Date) {
    const date = from || new Date();
    const padder = (num: number, length = 2) => {
      const currentLength = num.toString().length;
      return currentLength < length
        ? new Array(length - currentLength).fill(0).join('') + num
        : num.toString();
    };
    const year = date.getFullYear();
    const month = padder(date.getMonth() + 1);
    const day = padder(date.getDate());
    const hour = padder(date.getHours());
    const minute = padder(date.getMinutes());
    const second = padder(date.getSeconds());
    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
  }

  private getGitContent(path: string) {
    const { login, repository } = this._user;
    return this.github.getRepositoryContent(login, repository, path).then(res => {
      res.data.content = this.toData(res.data.content);
      return res;
    });
  }

  private putGitContent(
    path: string,
    content: string,
    commitConfig: GitHubCoreInterface.Commit | GitHubCoreInterface.HashRequiredCommit,
  ) {
    const { login, repository, branch } = this._user;
    return this.github.putRepositoryContent(login, repository, path, this.toContent(content), {
      ...commitConfig,
      ...(branch ? { branch } : null),
    });
  }

  private moveGitContent(originPath: string, targetPath: string) {
    this.isReady({ raiseError: true });
    const { login, repository } = this._user;
    this.updateGitTree()
      .then(() => {
        this._refs.tree.forEach(ref => {
          if (ref.path === originPath) ref.path = targetPath;
          if (ref.type === 'tree') delete ref.sha;
        });
      })
      .then(() => this.github.postTree(login, repository, this._refs.tree))
      .then(() => this.github.commit(login, repository, this._refs.sha, this._refs.tree, 'Move'))
      .then(() => this.updateGitTree());
  }

  private deleteGitContent(path: string, commitConfig: GitHubCoreInterface.HashRequiredCommit) {
    const { login, repository, branch } = this._user;
    return this.github.deleteRepositoryContent(login, repository, path, {
      ...commitConfig,
      ...(branch ? { branch } : null),
    });
  }

  prepareDatabase() {
    this._db
      .store('user', {
        login: String,
        name: String,
        bio: String,
        photo: String,
        theme: String,
        repository: String,
        branch: String,
        token: String,
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

  async reset() {
    this._refs.sha = '';
    this._refs.tree = [];
    this._user = EMPTY_USER;
    this._init = false;
    this.github.setToken(); // clear
    await Promise.all([this._db.delete('user'), this._db.delete('tag'), this._db.delete('note')]);
  }

  initUser(user: User) {
    this.github.setToken(user.token);
    this._user = user;
  }

  initGit() {
    return this.updateGitTree();
  }

  async updateGitTree() {
    const { login, repository, branch } = this._user;
    const { data } = await this.github.getTree(login, repository, branch);
    this._refs = {
      sha: data.sha,
      tree: data.tree,
    };
  }

  getUserFromDB() {
    return this._db.select<User & Profile>('user').then(users => users[0]);
  }

  saveUser(user: User & Profile) {
    return this._db.insert<User & Profile>('user', user);
  }

  updateUser(user: User & Profile) {
    return this._db
      .update<User & Profile>('user', user, {
        login: user.login,
      })
      .then(affectedRows => affectedRows > 0);
  }

  loadMeta() {
    const meta = this._refs.tree.find(ref => ref.path === GitNotesCore.META_FILE);

    if (meta) {
      return this.getGitContent(GitNotesCore.META_FILE).then(({ data }) => {
        const meta = JSON.parse(this.toData(data.content)) as GitNotesMeta;
        this._init = true;
        this._metaHash = data.sha;
        return meta;
      });
    } else {
      return this.saveMeta([], []);
    }
  }

  createMeta() {
    return this.putGitContent(GitNotesCore.META_FILE, JSON.stringify(initialMeta, null, 2), {
      message: 'Hello, GitNotes!',
    }).then(() => (this._init = true));
  }

  saveMeta(tags: Tag[], notes: Note[]) {
    const metadata: GitNotesMeta = {
      version: pkg.version,
      tags,
      notes,
    };

    return this.putGitContent(GitNotesCore.META_FILE, JSON.stringify(metadata, null, 2), {
      message: 'Hello, GitNotes!',
      ...(this._metaHash ? { sha: this._metaHash } : null),
    }).then(({ data }) => {
      this._metaHash = data.sha;
      return metadata;
    });
  }

  createTag(tagName: string, color: string) {
    const tagMeta = `${GitNotesCore.NOTES_FOLDER}/${tagName}/.tag`;
    const tagData: Tag = {
      id: GitNotesCore.createId(),
      name: tagName,
      color,
    };

    return this.putGitContent(tagMeta, JSON.stringify(tagData, null, 2), {
      message: `GitNotes ${this.getTimestamp()}`,
    }).then(() => tagData);
  }
}

const core = GitNotesCore.getInstance();
export default core;
