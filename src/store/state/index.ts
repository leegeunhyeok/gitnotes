import { Types as CoreTypes } from '@/core';
import { initialMeta } from '../../core/index';

export interface State {
  ready: boolean;
  loading: boolean;
  login: string;
  name: string;
  bio: string;
  photo: string;
  theme: CoreTypes.GitNotesTheme;
  token: string;
  repository: string;
  branch: string;
  _meta: CoreTypes.GitNotesMeta;
}

export const state: State = {
  ready: false,
  loading: false,
  login: '',
  name: '',
  bio: '',
  photo: '',
  theme: 'blue',
  token: '',
  repository: '',
  branch: '',
  _meta: initialMeta,
};
