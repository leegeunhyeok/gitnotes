export interface GitNotesMeta {
  version: string;
  tags: Tag[];
  notes: Note[];
}

export interface User {
  login: string;
  repository: string;
  branch: string;
  token: string;
}

export interface Profile {
  name: string;
  bio: string;
  photo: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  tag: string | null;
  title: string;
  createdAt: number;
  updatedAt: number | null;
}

export interface RaiseErrorConfig {
  raiseError?: boolean;
}

export type ReplaceFileName = string | { origin: string; new: string };
