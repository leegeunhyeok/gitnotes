import { v4 as uuidv4 } from 'uuid';
import { encode, decode } from 'js-base64';
import GithubAPI from '@/apis/github';
import GitNotesDB from '@/database';
import pkg from '~/package.json';
import { Ref } from '@/interfaces/github';

export interface GitNotesMeta {
  version: string;
  tags: Tag[];
  notes: Note[];
}

export interface User {
  login: string;
  name: string;
  bio: string;
  photo: string;
  token: string;
  repository: string;
  branch: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  tag: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const initialMeta: GitNotesMeta = {
  version: pkg.version,
  tags: [],
  notes: [],
};

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
  private _refs: { sha: string; tree: Ref[] } = { sha: '', tree: [] };
  private _lastCommit?: string;
  private _metaHash?: string;
  private _username?: string;
  private _repository?: string;
  private _branch?: string;
  private _init = false;

  private constructor() {
    GitNotesCore.instance = this;
  }

  public static getInstance() {
    if (!GitNotesCore.instance) {
      GitNotesCore.instance = new GitNotesCore();
    }
    return GitNotesCore.instance;
  }

  public static createId() {
    return uuidv4();
  }

  private getTimestamp(from?: Date) {
    const date = from || new Date();
    const padder = (num: number, length = 2) => {
      const currentLength = num.toString().length;
      return currentLength < length
        ? num + new Array(length - currentLength).fill(0).join('')
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

  prepareDatabase() {
    this._db
      .store('user', {
        login: String,
        name: String,
        bio: String,
        photo: String,
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
    this._lastCommit = undefined;
    this._username = undefined;
    this._repository = undefined;
    this._branch = undefined;
    this._init = false;
    await Promise.all([this._db.delete('user'), this._db.delete('tag'), this._db.delete('note')]);
  }

  async gitInit(username: string, repositoryName: string, branch: string, token: string) {
    GithubAPI.setPersonalAccessToken(token);
    const lastCommit = await GithubAPI.getRef(username, repositoryName, branch);
    await this.updateGitTree(username, repositoryName, lastCommit);
    this._username = username;
    this._repository = repositoryName;
    this._branch = branch;
  }

  async updateGitTree(username: string, repositoryName: string, lastCommit: string) {
    this._refs = await GithubAPI.getTree(username, repositoryName, lastCommit);
    this._lastCommit = this._refs.sha;
  }

  getUserFromDB() {
    return this._db.select<User>('user').then(users => users[0]);
  }

  saveUser(user: User) {
    return this._db.insert<User>('user', user);
  }

  updateUser(user: User) {
    return this._db
      .update<User>('user', user, {
        login: user.login,
      })
      .then(affectedRows => affectedRows > 0);
  }

  loadMeta() {
    if (!this._refs.tree.length) throw new Error('Tree not initalized');
    const meta = this._refs.tree.find(ref => ref.path === GitNotesCore.META_FILE);

    if (meta) {
      return GithubAPI.getRepositoryContent({
        user: this._username!,
        repository: this._repository!,
        path: GitNotesCore.META_FILE,
      }).then(({ data }) => {
        const meta = JSON.parse(decode(data.content)) as GitNotesMeta;
        this._init = true;
        this._metaHash = data.sha;
        return meta;
      });
    } else {
      throw new GitNotesError('GitNotes metadata not found');
    }
  }

  saveMeta(tags: Tag[], notes: Note[]) {
    const metadata = {
      version: pkg.version,
      tags,
      notes,
    };

    return GithubAPI.putRepositoryContent({
      message: GitNotesCore.COMMIT_PREFIX + 'Metadata saved',
      content: encode(JSON.stringify(metadata, null, 2)),
      ...(this._metaHash ? { sha: this._metaHash } : null),
      user: this._username!,
      repository: this._repository!,
      path: GitNotesCore.META_FILE,
    }).then(({ data }) => {
      this._metaHash = data.sha;
    });
  }

  createTag(tagName: string, color: string) {
    const tagMeta = `${GitNotesCore.NOTES_FOLDER}/${tagName}/.tag`;
    const tagData: Tag = {
      id: GitNotesCore.createId(),
      name: tagName,
      color,
    };
    return this.putContent(tagMeta, JSON.stringify(tagData, null, 2)).then(() => tagData);
  }

  getNote(name: string, tagName?: string) {
    if (!this._init) throw new Error('Core not initalized');
    const noteFile = `${name}.md`;
    const noteFilePath = [GitNotesCore.NOTES_FOLDER, tagName, noteFile].filter(x => x).join('/');
    return this.getContent(noteFilePath).then(res => decode(res.data.content));
  }

  putNote(name: string, content: string, tagName?: string) {
    if (!this._init) throw new Error('Core not initalized');
    const noteFile = `${name}.md`;
    const noteFilePath = [GitNotesCore.NOTES_FOLDER, tagName, noteFile].filter(x => x).join('/');
    const existNote = this._refs.tree.find(ref => ref.path === noteFilePath);

    return this.putContent(
      noteFilePath,
      encode(content),
      existNote ? existNote.sha : undefined,
    ).then(({ data }) => {
      return this.updateGitTree(this._username!, this._repository!, data.commit.sha).then(
        () => data,
      );
    });
  }

  async moveNote(
    originName: string,
    originTagName?: string,
    newName?: string,
    newTagName?: string,
  ) {
    const noteFile = `${originName}.md`;
    const originPath = [GitNotesCore.NOTES_FOLDER, originTagName, noteFile]
      .filter(x => x)
      .join('/');
    const originNote = this._refs.tree.find(ref => ref.path === originPath);

    if (!originNote) throw new GitNotesError(`${originPath} not found`);
    const newFile = `${newName}.md`;
    const targetPath = [GitNotesCore.NOTES_FOLDER, newTagName, newFile].filter(x => x).join('/');

    return this.moveContent(originPath, targetPath);
  }

  async deleteNote(title: string, tagName?: string) {
    const noteFile = `${title}.md`;
    const noteFilePath = [GitNotesCore.NOTES_FOLDER, tagName, noteFile].filter(x => x).join('/');
    const targetNote = this._refs.tree.find(ref => ref.path === noteFilePath);

    if (!targetNote) throw new GitNotesError(`${noteFilePath} not found`);

    return GithubAPI.deleteRepositoryContent({
      path: noteFilePath,
      sha: targetNote.sha as string,
      message: 'DELETE',
      user: this._username!,
      repository: this._repository!,
    });
  }

  getContent(path: string) {
    if (!this._init) throw new Error('Core not initalized');
    return GithubAPI.getRepositoryContent({
      user: this._username!,
      repository: this._repository!,
      path,
    });
  }

  putContent(path: string, content: string, sha?: string) {
    if (!this._init) throw new Error('Core not initalized');
    return GithubAPI.putRepositoryContent({
      content: encode(content),
      ...(sha ? { sha } : null),
      message: `GitNotes ${this.getTimestamp()}`,
      user: this._username!,
      repository: this._repository!,
      path,
    });
  }

  deleteContent(path: string, sha: string) {
    return GithubAPI.deleteRepositoryContent({
      sha,
      message: `GitNotes ${this.getTimestamp()}`,
      user: this._username!,
      repository: this._repository!,
      path,
    });
  }

  async moveContent(originPath: string, targetPath: string) {
    if (!this._init) throw new Error('Core not initalized');
    const username = this._username!;
    const repository = this._repository!;
    const lastCommit = this._lastCommit!;
    await this.updateGitTree(username, repository, lastCommit);

    this._refs.tree.forEach(ref => {
      if (ref.path === originPath) ref.path = targetPath;
      if (ref.type === 'tree') delete ref.sha;
    });

    await GithubAPI.postTree(username, repository, this._refs.tree);
    this._lastCommit = await GithubAPI.commit(
      username,
      repository,
      lastCommit,
      this._refs.tree,
      'Move',
    );
  }
}

const core = GitNotesCore.getInstance();
export default core;
