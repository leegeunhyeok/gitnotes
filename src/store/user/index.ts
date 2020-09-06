import { Module } from 'vuex';
import { RootState } from '@/store';
import GithubAPI from '@/apis/github';
import { AxiosError } from 'axios';

interface UserState {
  name: string;
  bio: string;
  photo: string;
}

const initialState: UserState = {
  name: '',
  bio: '',
  photo: '',
};

const userModule: Module<UserState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    SET_NAME(state, name: string) {
      state.name = name;
    },
    SET_BIO(state, bio: string) {
      state.bio = bio;
    },
  },
  actions: {
    GET_PROFILE({ commit }, name) {
      return GithubAPI.getUser(name).then(user => {
        commit('SET_NAME', user.name);
        commit('SET_BIO', user.bio || '');
        commit('SET_PHOTO', user.avatar_url || '');
      });
    },
  },
};

export default userModule;
