export interface ObjectStore {
  _id: number;
}

export interface UserObjectStore extends ObjectStore {
  name: string;
  bio: string;
  photo: string;
  token: string;
}

export interface RepositoryObjectStore extends ObjectStore {
  name: string;
  branch: string;
}

export interface TagObjectStore extends ObjectStore {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface NoteObjectStore extends ObjectStore {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
