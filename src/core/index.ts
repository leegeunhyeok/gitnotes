import { v4 as uuidv4 } from 'uuid';
import { encode, decode } from 'js-base64';
import { GitNotesMeta, User, Profile, Note, Tag, RaiseErrorConfig, ReplaceFileName } from '@/core/types';
import GitHubCore, { Types as GitHubCoreTypes } from '@/core/github';
import GitNotesDB from '@/core/database';
export * as Types from '@/core/types';
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

export class GitNotesError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class GitNotesCore {
  private static instance: GitNotesCore | null = null;
  public static COMMIT_PREFIX = 'GitNotes';
  public static META_FILE_PATH = '.gitnotes';
  public static NOTES_DIRECTORY = 'notes';
  private _db = GitNotesDB.getInstance();
  private _refs: { sha: string; tree: GitHubCoreTypes.Ref[] } = { sha: '', tree: [] };
  private _meta = initialMeta;
  private _metaHash?: string;
  private _user: User = EMPTY_USER;
  private _init = false;
  public github = GitHubCore;

  private constructor() {
    this.prepareDatabase();
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

  private toCommitMessage(...message: string[]) {
    return `${GitNotesCore.COMMIT_PREFIX} ${this.getTimestamp()} - ${message.join(' ')}`;
  }

  private toValidFilename(name: string) {
    return (
      name
        // eslint-disable-next-line no-useless-escape
        .replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"ㄱ-ㅎ]/gi, '')
        .replace(/[^a-zA-Z0-9가-힣]/, '_')
    );
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
    commitConfig: GitHubCoreTypes.Commit | GitHubCoreTypes.HashRequiredCommit,
  ) {
    const { login, repository, branch } = this._user;
    return this.github.putRepositoryContent(login, repository, path, this.toContent(content), {
      ...commitConfig,
      ...(branch ? { branch } : null),
    });
  }

  private moveGitContent(originPath: string, targetPath: string, filename: ReplaceFileName[]) {
    this.isReady({ raiseError: true });
    const { login, repository } = this._user;
    return this.updateGitTree()
      .then(() => {
        this._refs.tree.forEach(ref => {
          if (ref.path === originPath && ref.type === 'tree') ref.path = targetPath;
          if (ref.path.startsWith(originPath)) {
            filename.forEach((file) => {
              if (typeof file === 'string') {
                if (ref.path === `${originPath}/${file}`) ref.path = `${targetPath}/${file}`;
              } else {
                if (ref.path === `${originPath}/${file.origin}`) ref.path = `${targetPath}/${file.new}`;
              }
            });
          }
        });
      })
      .then(() => this.github.postTree(login, repository, this._refs.tree))
      .then(({ data }) => data.sha)
      .then((treeHash) =>
        this.github.commit(
          login,
          repository,
          this._refs.sha,
          treeHash,
          this.toCommitMessage('@move'),
        ),
      )
      .then(() => this.updateGitTree());
  }

  private deleteGitContent(path: string, commitConfig: GitHubCoreTypes.HashRequiredCommit) {
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
        color: String
      })
      .store('note', {
        id: String,
        title: String,
        content: String,
        createdAt: Number,
        updatedAt: Number,
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

  getUser() {
    return this._db.select<User & Profile>('user').then(users => users[0]);
  }

  deleteUser () {
    return this._db.delete('user').then(affected => affected > 0);
  }

  saveUser(user: User & Profile) {
    return this._db.insert<User & Profile>('user', user).then(() => true);
  }

  updateUser(user: User & Profile) {
    return this._db
      .update<User & Profile>('user', user, {
        login: user.login,
      })
      .then(affectedRows => affectedRows > 0);
  }

  loadMeta() {
    // Load metadata
    // or
    // save new metadata if not exist.
    return this.updateGitTree().then(() => {
      const meta = this._refs.tree.find(ref => ref.path === GitNotesCore.META_FILE_PATH);
      if (!meta) throw new Error('Metadata not found (maybe this repository is empty)');
      return this.getGitContent(GitNotesCore.META_FILE_PATH).then(({ data }) => {
        const meta = JSON.parse(data.content) as GitNotesMeta;
        this._metaHash = data.sha;
        return meta;
      });
    })
      .catch(() => this.saveMeta())
      .then(meta => {
        this._meta = meta;
        this._init = true;
        return meta;
      });
  }

  saveMeta() {
    const metadata: GitNotesMeta = {
      version: pkg.version,
      tags: this._meta.tags,
      notes: this._meta.notes,
    };

    return this.putGitContent(GitNotesCore.META_FILE_PATH, JSON.stringify(metadata, null, 2), {
      message: this.toCommitMessage('Save metadata'),
      ...(this._metaHash ? { sha: this._metaHash } : null),
    }).then(({ data }) => {
      this._metaHash = data.content.sha;
      return metadata;
    });
  }

  createTag(tagName: string, color: string) {
    const tagMetaPath = `${GitNotesCore.NOTES_DIRECTORY}/${tagName}/.tag`;
    const tagData: Tag = {
      id: GitNotesCore.createId(),
      name: tagName,
      color,
    };

    return this.putGitContent(tagMetaPath, JSON.stringify(tagData, null, 2), {
      message: this.toCommitMessage(`'${tagName}' tag created`),
    })
      .then(() => this._meta.tags.push(tagData))
      .then(() => this._meta);
  }

  updateTag(tagId: string, newTagName: string, newTagColor?: string) {
    const targetTag = this._meta.tags.find(tag => tag.id === tagId);
    if (!targetTag) throw new GitNotesError(`Tag ${tagId} not found`);

    const originTagBase = `${GitNotesCore.NOTES_DIRECTORY}/${targetTag.name}`;
    const newTagBase = `${GitNotesCore.NOTES_DIRECTORY}/${newTagName}`;

    const moveContents = this._meta.notes
      .filter(note => note.tag === targetTag.id)
      .map(({ title }) => `${this.toValidFilename(title)}.md`);

    return  this.moveGitContent(originTagBase, newTagBase, ['.tag', ...moveContents])
      .then(() => {
        targetTag.name = newTagName;
        targetTag.color = newTagColor || targetTag.color;
      })
      .then(() => this.saveMeta());
  }

  deleteTag(tagId: string) {
    const targetTagIdx = this._meta.tags.findIndex(tag => tag.id === tagId);
    if (!~targetTagIdx) throw new GitNotesError(`Tag ${tagId} not found`);

    const targetTag = this._meta.tags[targetTagIdx];
    const originTagBase = `${GitNotesCore.NOTES_DIRECTORY}/${targetTag.name}`;
    const originTagPath = `${GitNotesCore.NOTES_DIRECTORY}/${targetTag.name}/.tag`;

    const moveContents = this._meta.notes
      .filter(note => note.tag === targetTag.id)
      .map(({ title }) => `${this.toValidFilename(title)}.md`);


    return this.getGitContent(originTagPath)
      .then(({ data }) =>
        this.deleteGitContent(originTagPath, {
          message: `Delete tag: ${targetTag.name}`,
          sha: data.sha
        })
      )
      .then(() => this.moveGitContent(originTagBase, GitNotesCore.NOTES_DIRECTORY, moveContents))
      .then(() => this._meta.tags.splice(targetTagIdx, 1))
      .then(() => this.saveMeta());
  }

  createNote(title: string, content: string, tagId?: string) {
    let targetTag: Tag | null = null;
    if (tagId) {
      targetTag = this._meta.tags.find(tag => tag.id === tagId) || null;
      if (!targetTag) throw new GitNotesError(`Tag ${tagId} not found`);
    }

    const noteData: Note = {
      id: GitNotesCore.createId(),
      tag: targetTag ? targetTag.id : targetTag,
      title,
      createdAt: +new Date(),
      updatedAt: null,
    };
    const noteFilename = `${this.toValidFilename(noteData.title)}.md`;
    const noteFilePath = `${GitNotesCore.NOTES_DIRECTORY}/${
      targetTag ? `${targetTag.name}/${noteFilename}` : noteFilename
    }`;

    return this.putGitContent(noteFilePath, content, {
      message: this.toCommitMessage('Write new note'),
    })
      .then(() => this._meta.notes.push(noteData))
      .then(() => this.saveMeta());
  }

  getNote (noteId: string) {
    const targetNote = this._meta.notes.find(note => note.id === noteId);
    if (!targetNote) throw new GitNotesError(`Note ${noteId} not found`);

    const targetTag = this._meta.tags.find(tag => tag.id === targetNote.tag);
    if (!targetTag) throw new GitNotesError(`Tag ${targetNote.tag} not found`);

    const targetNoteFilename = `${this.toValidFilename(targetNote.title)}.md`;
    const targetNoteFilePath = `${GitNotesCore.NOTES_DIRECTORY}/${
      targetTag ? `${targetTag.name}/${targetNoteFilename}` : targetNoteFilename
    }`;

    return this.getGitContent(targetNoteFilePath).then(({ data }) => data.content);
  }

  updateNote(noteId: string, newTitle?: string, newContent?: string, newTagId?: string) {
    const targetNoteIdx = this._meta.notes.findIndex(note => note.id === noteId);
    if (!~targetNoteIdx) throw new GitNotesError(`Note ${noteId} not found`);

    let newTag: Tag | null = null;
    let originTag: Tag | null = null;
    if (newTagId) {
      newTag = this._meta.tags.find(tag => tag.id === newTagId) || null;
      if (!newTag) throw new GitNotesError(`Tag ${newTagId} not found`);
    }

    const originNote = this._meta.notes[targetNoteIdx];
    if (originNote.tag) {
      originTag = this._meta.tags.find(tag => tag.id === originNote.tag) || null;
      if (!originTag) throw new GitNotesError(`Tag ${originNote.tag} not found`);
    }

    const updateTag = !!newTag;
    const updateTitle = !!newTitle;
    const updateContent = !!newContent;
    const originPath = `${GitNotesCore.NOTES_DIRECTORY}${originTag ? `/${originTag.name}` : ''}`;
    const newPath = `${GitNotesCore.NOTES_DIRECTORY}${newTag ? `/${newTag.name}` : ''}`;
    const originNoteFilename = `${this.toValidFilename(originNote.title)}.md`;
    const newNoteFilename = newTitle ? `${this.toValidFilename(newTitle)}.md` : originNoteFilename;
    const originNoteFilePath = `${originPath}/${originNoteFilename}`
    const newNoteFilePath = `${newPath}/${newNoteFilename}`;

    return this.getGitContent(originNoteFilePath)
      .then(({ data }) => {
        const res = { content: newContent || data.content, sha: data.sha };
        return (updateTag || updateTitle) ?
          this.moveGitContent(originPath, newPath, [{ origin: originNoteFilename, new: newNoteFilename }])
            .then(() => res)
            : Promise.resolve(res);
      })
      .then(({ content, sha }) => 
        updateContent ? 
        this.putGitContent(newNoteFilePath, content, {
          message: this.toCommitMessage('Update note'),
          sha,
        }).then(() => void 0) : Promise.resolve()
      )
      .then(() => {
        this._meta.notes[targetNoteIdx] = {
          ...originNote,
          tag: newTag ? newTag.id : originNote.tag,
          title: newTitle ? newTitle : originNote.title,
          createdAt: originNote.createdAt,
          updatedAt: +new Date(),
        };
      })
      .then(() => this.saveMeta());
  }

  deleteNote(noteId: string) {
    const targetNoteIdx = this._meta.notes.findIndex(note => note.id === noteId);
    if (!~targetNoteIdx) throw new GitNotesError(`Note ${noteId} not found`);

    const targetNote = this._meta.notes[targetNoteIdx];
    const targetNotePath = `${GitNotesCore.NOTES_DIRECTORY}/${this.toValidFilename(
      targetNote.title,
    )}.md`;

    return this.getGitContent(targetNotePath)
      .then(({ data }) =>
        this.deleteGitContent(targetNotePath, {
          message: `Delete note: ${targetNote.title}`,
          sha: data.sha,
        }),
      )
      .then(() => this._meta.notes.splice(targetNoteIdx, 1))
      .then(() => this.saveMeta());
  }
}

const core = GitNotesCore.getInstance();
export default core;
