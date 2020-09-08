export interface State {
  loading: boolean;
  name: string;
  bio: string;
  photo: string;
}

export const state: State = {
  loading: false,
  name: '',
  bio: '',
  photo: '',
};
