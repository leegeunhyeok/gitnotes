export interface State {
  loading: boolean;
  name: string;
  bio: string;
  photo: string;
  token: string;
  repository: string;
  branch: string;
}

export const state: State = {
  loading: false,
  name: '',
  bio: '',
  photo: '',
  token: '',
  repository: '',
  branch: '',
};
