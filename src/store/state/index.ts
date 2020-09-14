import { GitNotesMeta, Note, Tag } from '@/core';

export interface State {
  init: boolean;
  gitInit: boolean;
  loading: boolean;
  databasePrepared: boolean;
  login: string;
  name: string;
  bio: string;
  photo: string;
  token: string;
  repository: string;
  branch: string;
  notes: Note[];
  tags: Tag[];
}

export const state: State = {
  init: false,
  gitInit: false,
  loading: false,
  databasePrepared: false,
  login: '',
  name: '',
  bio: '',
  photo: '',
  token: '',
  repository: '',
  branch: '',
  notes: [],
  tags: [],
};
