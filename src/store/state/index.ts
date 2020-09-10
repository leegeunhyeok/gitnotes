export interface State {
  loading: boolean;
  name: string;
  bio: string;
  token: string;
  photo: string;
}

export const state: State = {
  loading: false,
  name: '',
  bio: '',
  token: '',
  photo: '',
};
